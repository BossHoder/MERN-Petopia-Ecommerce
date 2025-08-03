import express from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../helpers/responseHelper.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import AnalyticsEvent from '../../models/AnalyticsEvent.js';

const router = express.Router();

/**
 * @desc    Get enhanced revenue analytics
 * @route   GET /api/analytics-enhanced/revenue
 * @access  Private/Admin
 */
router.get(
    '/revenue',
    requireJwtAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            // Revenue by time periods
            const revenueByDay = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        revenue: { $sum: '$pricing.total' },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            ]);

            // Revenue by payment method
            const revenueByPaymentMethod = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        revenue: { $sum: '$pricing.total' },
                        orders: { $sum: 1 },
                        avgOrderValue: { $avg: '$pricing.total' },
                    },
                },
            ]);

            // Revenue trends and forecasting
            const totalRevenue = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$pricing.total' },
                        orders: { $sum: 1 },
                        avgOrderValue: { $avg: '$pricing.total' },
                    },
                },
            ]);

            return successResponse(
                res,
                {
                    revenueByDay,
                    revenueByPaymentMethod,
                    totalRevenue: totalRevenue[0] || { total: 0, orders: 0, avgOrderValue: 0 },
                    trends: {
                        dailyAverage:
                            revenueByDay.length > 0
                                ? revenueByDay.reduce((sum, day) => sum + day.revenue, 0) / revenueByDay.length
                                : 0,
                        peakDay: revenueByDay.reduce(
                            (max, day) => (day.revenue > (max?.revenue || 0) ? day : max),
                            null,
                        ),
                    },
                },
                'Revenue analytics retrieved successfully',
            );
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            return errorResponse(res, 'Failed to fetch revenue analytics', 500);
        }
    }),
);

/**
 * @desc    Get enhanced product analytics
 * @route   GET /api/analytics-enhanced/products
 * @access  Private/Admin
 */
router.get(
    '/products',
    requireJwtAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            // Product performance from orders
            const productPerformance = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                { $unwind: '$orderItems' },
                {
                    $group: {
                        _id: '$orderItems.product',
                        totalQuantity: { $sum: '$orderItems.quantity' },
                        totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
                        totalOrders: { $sum: 1 },
                        avgPrice: { $avg: '$orderItems.price' },
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productInfo',
                    },
                },
                { $unwind: '$productInfo' },
                { $sort: { totalRevenue: -1 } },
                { $limit: 20 },
            ]);

            // Category performance
            const categoryPerformance = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                { $unwind: '$orderItems' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'orderItems.product',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: '$category' },
                {
                    $group: {
                        _id: '$category._id',
                        categoryName: { $first: '$category.name' },
                        totalQuantity: { $sum: '$orderItems.quantity' },
                        totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
                        uniqueProducts: { $addToSet: '$product._id' },
                    },
                },
                {
                    $addFields: {
                        uniqueProductCount: { $size: '$uniqueProducts' },
                    },
                },
                { $sort: { totalRevenue: -1 } },
            ]);

            // Inventory status
            const inventoryStatus = await Product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        inStock: { $sum: { $cond: [{ $gt: ['$countInStock', 0] }, 1, 0] } },
                        lowStock: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $gt: ['$countInStock', 0] }, { $lte: ['$countInStock', 10] }] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        outOfStock: { $sum: { $cond: [{ $eq: ['$countInStock', 0] }, 1, 0] } },
                        avgPrice: { $avg: '$price' },
                        totalValue: { $sum: { $multiply: ['$price', '$countInStock'] } },
                    },
                },
            ]);

            return successResponse(
                res,
                {
                    productPerformance,
                    categoryPerformance,
                    inventoryStatus: inventoryStatus[0] || {
                        totalProducts: 0,
                        inStock: 0,
                        lowStock: 0,
                        outOfStock: 0,
                        avgPrice: 0,
                        totalValue: 0,
                    },
                },
                'Product analytics retrieved successfully',
            );
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            return errorResponse(res, 'Failed to fetch product analytics', 500);
        }
    }),
);

/**
 * @desc    Get enhanced customer analytics
 * @route   GET /api/analytics-enhanced/customers
 * @access  Private/Admin
 */
router.get(
    '/customers',
    requireJwtAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            // Customer acquisition
            const customerAcquisition = await User.aggregate([
                { $match: { ...dateFilter, role: 'user' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        newCustomers: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            ]);

            // Customer lifetime value
            const customerLTV = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$user',
                        totalSpent: { $sum: '$pricing.total' },
                        orderCount: { $sum: 1 },
                        firstOrder: { $min: '$createdAt' },
                        lastOrder: { $max: '$createdAt' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        avgLifetimeValue: { $avg: '$totalSpent' },
                        avgOrderCount: { $avg: '$orderCount' },
                        totalCustomers: { $sum: 1 },
                    },
                },
            ]);

            // Customer segmentation
            const customerSegmentation = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$user',
                        totalSpent: { $sum: '$pricing.total' },
                        orderCount: { $sum: 1 },
                    },
                },
                {
                    $bucket: {
                        groupBy: '$totalSpent',
                        boundaries: [0, 100, 500, 1000, 5000, Infinity],
                        default: 'Other',
                        output: {
                            customers: { $sum: 1 },
                            avgOrderCount: { $avg: '$orderCount' },
                            totalRevenue: { $sum: '$totalSpent' },
                        },
                    },
                },
            ]);

            // Customer retention
            const retentionData = await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$user',
                        orderCount: { $sum: 1 },
                        firstOrder: { $min: '$createdAt' },
                        lastOrder: { $max: '$createdAt' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        oneTimeCustomers: { $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] } },
                        repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } },
                        totalCustomers: { $sum: 1 },
                    },
                },
                {
                    $addFields: {
                        retentionRate: {
                            $multiply: [{ $divide: ['$repeatCustomers', '$totalCustomers'] }, 100],
                        },
                    },
                },
            ]);

            return successResponse(
                res,
                {
                    customerAcquisition,
                    customerLTV: customerLTV[0] || {
                        avgLifetimeValue: 0,
                        avgOrderCount: 0,
                        totalCustomers: 0,
                    },
                    customerSegmentation,
                    retention: retentionData[0] || {
                        oneTimeCustomers: 0,
                        repeatCustomers: 0,
                        totalCustomers: 0,
                        retentionRate: 0,
                    },
                },
                'Customer analytics retrieved successfully',
            );
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
            return errorResponse(res, 'Failed to fetch customer analytics', 500);
        }
    }),
);

/**
 * @desc    Get enhanced conversion analytics
 * @route   GET /api/analytics-enhanced/conversion
 * @access  Private/Admin
 */
router.get(
    '/conversion',
    requireJwtAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.timestamp = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            // Conversion funnel from analytics events
            const funnelData = await AnalyticsEvent.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$eventType',
                        count: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$sessionId' },
                    },
                },
                {
                    $addFields: {
                        uniqueUserCount: { $size: '$uniqueUsers' },
                    },
                },
            ]);

            // Conversion by traffic source (simulated)
            const conversionBySource = [
                { source: 'Organic Search', visitors: 3500, conversions: 147, rate: 4.2 },
                { source: 'Direct', visitors: 2800, conversions: 190, rate: 6.8 },
                { source: 'Social Media', visitors: 1800, conversions: 38, rate: 2.1 },
                { source: 'Paid Search', visitors: 1200, conversions: 42, rate: 3.5 },
                { source: 'Email', visitors: 600, conversions: 51, rate: 8.5 },
            ];

            // Orders data for conversion calculation
            const ordersData = await Order.aggregate([
                { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$pricing.total' },
                    },
                },
            ]);

            return successResponse(
                res,
                {
                    funnelData,
                    conversionBySource,
                    ordersData: ordersData[0] || { totalOrders: 0, totalRevenue: 0 },
                    conversionMetrics: {
                        overallConversionRate: funnelData.find((f) => f._id === 'purchase')?.count || 0,
                        cartAbandonmentRate: 65, // Simulated
                        checkoutAbandonmentRate: 30, // Simulated
                    },
                },
                'Conversion analytics retrieved successfully',
            );
        } catch (error) {
            console.error('Error fetching conversion analytics:', error);
            return errorResponse(res, 'Failed to fetch conversion analytics', 500);
        }
    }),
);

export default router;
