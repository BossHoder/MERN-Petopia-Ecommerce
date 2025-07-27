import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';

// ===========================================
// DASHBOARD CONTROLLERS
// ===========================================

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Get current date and date 30 days ago for comparison
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Parallel queries for better performance
        const [totalUsers, totalProducts, totalOrders, totalRevenue, recentUsers, recentOrders, recentRevenue] =
            await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
                User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
                Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
                Order.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
                ]),
            ]);

        // Calculate growth percentages
        const calculateGrowth = (current, recent) => {
            const previous = current - recent;
            if (previous === 0) return recent > 0 ? 100 : 0;
            return ((recent / previous) * 100).toFixed(1);
        };

        const stats = {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            growth: {
                users: calculateGrowth(totalUsers, recentUsers),
                orders: calculateGrowth(totalOrders, recentOrders),
                revenue: calculateGrowth(totalRevenue[0]?.total || 0, recentRevenue[0]?.total || 0),
            },
        };

        return successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return errorResponse(res, 'Failed to retrieve dashboard stats', 500);
    }
});

/**
 * @desc    Get recent orders for dashboard
 * @route   GET /api/admin/dashboard/recent-orders
 * @access  Private/Admin
 */
const getRecentOrders = asyncHandler(async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber totalPrice orderStatus createdAt user guestInfo');

        return successResponse(res, recentOrders, 'Recent orders retrieved successfully');
    } catch (error) {
        console.error('Recent orders error:', error);
        return errorResponse(res, 'Failed to retrieve recent orders', 500);
    }
});

/**
 * @desc    Get all orders for admin management
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;

        // Build query
        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'guestInfo.email': { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [orders, totalOrders] = await Promise.all([
            Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(query),
        ]);

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            hasNext: page < Math.ceil(totalOrders / limit),
            hasPrev: page > 1,
        };

        return successResponse(res, { orders, pagination }, 'Orders retrieved successfully');
    } catch (error) {
        console.error('Get all orders error:', error);
        return errorResponse(res, 'Failed to retrieve orders', 500);
    }
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, 'Invalid order status', 400);
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus: status,
                ...(status === 'delivered' && { deliveredAt: new Date() }),
            },
            { new: true },
        ).populate('user', 'name email');

        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
        console.error('Update order status error:', error);
        return errorResponse(res, 'Failed to update order status', 500);
    }
});

/**
 * @desc    Get recent users for dashboard
 * @route   GET /api/admin/dashboard/recent-users
 * @access  Private/Admin
 */
const getRecentUsers = asyncHandler(async (req, res) => {
    try {
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt avatar');

        return successResponse(res, recentUsers, 'Recent users retrieved successfully');
    } catch (error) {
        console.error('Recent users error:', error);
        return errorResponse(res, 'Failed to retrieve recent users', 500);
    }
});

/**
 * @desc    Get sales analytics
 * @route   GET /api/admin/analytics/sales
 * @access  Private/Admin
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
    try {
        // Mock analytics data - implement actual analytics logic
        const analyticsData = {
            monthlySales: [],
            topProducts: [],
            salesByCategory: [],
        };

        return successResponse(res, analyticsData, 'Sales analytics retrieved successfully');
    } catch (error) {
        console.error('Sales analytics error:', error);
        return errorResponse(res, 'Failed to retrieve sales analytics', 500);
    }
});

/**
 * @desc    Get all users for admin management
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query),
        ]);

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            hasNext: page < Math.ceil(totalUsers / limit),
            hasPrev: page > 1,
        };

        return successResponse(res, { users, pagination }, 'Users retrieved successfully');
    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, 'Failed to retrieve users', 500);
    }
});

// Export all controller functions
export default {
    getDashboardStats,
    getRecentOrders,
    getRecentUsers,
    getAllOrders,
    updateOrderStatus,
    getOrderDetails: asyncHandler(async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId)
                .populate('user', 'name email')
                .populate('orderItems.product', 'name');

            if (!order) {
                return errorResponse(res, 'Order not found', 404);
            }

            return successResponse(res, order, 'Order details retrieved successfully');
        } catch (error) {
            console.error('Get order details error:', error);
            return errorResponse(res, 'Failed to retrieve order details', 500);
        }
    }),
    getSalesAnalytics,
    getAllUsers,
    // Placeholder functions for future implementation
    getProductAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product analytics retrieved successfully');
    }),
    getUserAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'User analytics retrieved successfully');
    }),
    getOrderAnalytics: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Order analytics retrieved successfully');
    }),
    updateUserRole: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'User role updated successfully');
    }),
    updateUserStatus: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'User status updated successfully');
    }),
    getUserDetails: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'User details retrieved successfully');
    }),
    getAllProductsAdmin: asyncHandler(async (req, res) => {
        return successResponse(res, [], 'Products retrieved successfully');
    }),
    bulkUpdateProducts: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Products updated successfully');
    }),
    toggleProductFeatured: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product featured status updated successfully');
    }),
    toggleProductPublish: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Product publish status updated successfully');
    }),
    getAllCategoriesAdmin: asyncHandler(async (req, res) => {
        return successResponse(res, [], 'Categories retrieved successfully');
    }),
    createCategory: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Category created successfully');
    }),
    updateCategory: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Category updated successfully');
    }),
    deleteCategory: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'Category deleted successfully');
    }),
    getSystemSettings: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'System settings retrieved successfully');
    }),
    updateSystemSettings: asyncHandler(async (req, res) => {
        return successResponse(res, {}, 'System settings updated successfully');
    }),
};
