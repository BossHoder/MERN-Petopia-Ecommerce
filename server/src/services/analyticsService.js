import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * Analytics Service
 * Handles all analytics operations and reporting
 */
class AnalyticsService {
    /**
     * Track an analytics event
     */
    async trackEvent(eventData) {
        try {
            const event = new AnalyticsEvent(eventData);
            await event.save();

            return {
                success: true,
                event,
            };
        } catch (error) {
            console.error('Error tracking analytics event:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get comprehensive business analytics
     */
    async getBusinessAnalytics(dateRange = {}) {
        try {
            const { start, end } = dateRange;
            const dateFilter =
                start && end
                    ? {
                          createdAt: {
                              $gte: new Date(start),
                              $lte: new Date(end),
                          },
                      }
                    : {};

            const [revenueAnalytics, productAnalytics, customerAnalytics, conversionFunnel, topProducts] =
                await Promise.all([
                    this.getRevenueAnalytics(dateFilter),
                    this.getProductAnalytics(dateFilter),
                    this.getCustomerAnalytics(dateFilter),
                    AnalyticsEvent.getConversionFunnel(dateRange),
                    AnalyticsEvent.getTopProducts(10, dateRange),
                ]);

            return {
                success: true,
                analytics: {
                    revenue: revenueAnalytics,
                    products: productAnalytics,
                    customers: customerAnalytics,
                    conversion: conversionFunnel,
                    topProducts,
                    dateRange: { start, end },
                    generatedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Error getting business analytics:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(dateFilter = {}) {
        const orders = await Order.aggregate([
            { $match: { ...dateFilter, status: { $nin: ['cancelled', 'refunded'] } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    dailyRevenue: { $sum: '$pricing.total' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$pricing.total' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const totalRevenue = orders.reduce((sum, day) => sum + day.dailyRevenue, 0);
        const totalOrders = orders.reduce((sum, day) => sum + day.orderCount, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            dailyBreakdown: orders,
        };
    }

    /**
     * Get product analytics
     */
    async getProductAnalytics(dateFilter = {}) {
        // Top selling products
        const topSellingProducts = await Order.aggregate([
            { $match: { ...dateFilter, status: { $nin: ['cancelled', 'refunded'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo',
                },
            },
            { $unwind: '$productInfo' },
        ]);

        // Product performance metrics
        const productMetrics = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    lowStockProducts: {
                        $sum: { $cond: [{ $lte: ['$stockQuantity', 10] }, 1, 0] },
                    },
                    outOfStockProducts: {
                        $sum: { $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0] },
                    },
                    averagePrice: { $avg: '$price' },
                },
            },
        ]);

        return {
            topSellingProducts,
            productMetrics: productMetrics[0] || {},
        };
    }

    /**
     * Get customer analytics
     */
    async getCustomerAnalytics(dateFilter = {}) {
        // Customer acquisition
        const newCustomers = await User.countDocuments({
            ...dateFilter,
            role: 'USER',
        });

        // Customer lifetime value
        const customerLTV = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
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
                    averageLifetimeValue: { $avg: '$totalSpent' },
                    averageOrdersPerCustomer: { $avg: '$orderCount' },
                    totalCustomers: { $sum: 1 },
                },
            },
        ]);

        // Customer retention (customers who made multiple orders)
        const retentionData = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    oneTimeCustomers: {
                        $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] },
                    },
                    repeatCustomers: {
                        $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] },
                    },
                    totalCustomers: { $sum: 1 },
                },
            },
        ]);

        const retention = retentionData[0] || {};
        const retentionRate =
            retention.totalCustomers > 0
                ? ((retention.repeatCustomers / retention.totalCustomers) * 100).toFixed(2)
                : 0;

        return {
            newCustomers,
            lifetimeValue: customerLTV[0] || {},
            retention: {
                ...retention,
                retentionRate: parseFloat(retentionRate),
            },
        };
    }

    /**
     * Get real-time analytics dashboard data
     */
    async getRealTimeAnalytics() {
        try {
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

            const [todayEvents, activeUsers, recentOrders, recentSignups] = await Promise.all([
                AnalyticsEvent.countDocuments({
                    timestamp: { $gte: yesterday },
                }),
                this.getActiveUsers(),
                Order.find({ createdAt: { $gte: yesterday } })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('user', 'name email'),
                User.countDocuments({
                    createdAt: { $gte: yesterday },
                    role: 'USER',
                }),
            ]);

            return {
                success: true,
                realTime: {
                    todayEvents,
                    activeUsers,
                    recentOrders,
                    recentSignups,
                    lastUpdated: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Error getting real-time analytics:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get active users (users with activity in last 30 minutes)
     */
    async getActiveUsers() {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const activeUsers = await AnalyticsEvent.distinct('userId', {
            timestamp: { $gte: thirtyMinutesAgo },
            userId: { $ne: null },
        });

        return activeUsers.length;
    }

    /**
     * Generate analytics report
     */
    async generateReport(reportType = 'weekly', dateRange = {}) {
        try {
            const analytics = await this.getBusinessAnalytics(dateRange);

            if (!analytics.success) {
                return analytics;
            }

            const report = {
                reportType,
                dateRange: analytics.analytics.dateRange,
                summary: {
                    totalRevenue: analytics.analytics.revenue.totalRevenue,
                    totalOrders: analytics.analytics.revenue.totalOrders,
                    averageOrderValue: analytics.analytics.revenue.averageOrderValue,
                    conversionRate: this.calculateOverallConversionRate(analytics.analytics.conversion),
                    topPerformingProduct: analytics.analytics.topProducts[0] || null,
                },
                detailedAnalytics: analytics.analytics,
                generatedAt: new Date().toISOString(),
            };

            return {
                success: true,
                report,
            };
        } catch (error) {
            console.error('Error generating analytics report:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Calculate overall conversion rate from funnel data
     */
    calculateOverallConversionRate(conversionFunnel) {
        const productViews = conversionFunnel.product_viewed?.count || 0;
        const orders = conversionFunnel.order_completed?.count || 0;

        return productViews > 0 ? ((orders / productViews) * 100).toFixed(2) : 0;
    }
}

export default new AnalyticsService();
