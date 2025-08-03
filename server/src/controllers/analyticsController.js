import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';
import analyticsService from '../services/analyticsService.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Analytics Controller
 * Handles all analytics-related endpoints
 */

/**
 * @desc    Track analytics event
 * @route   POST /api/analytics/events
 * @access  Public (for tracking user interactions)
 */
export const trackEvent = asyncHandler(async (req, res) => {
    try {
        const { eventType, eventData, sessionId } = req.body;

        if (!eventType || !eventData || !sessionId) {
            return errorResponse(res, 'Missing required fields: eventType, eventData, sessionId', 400);
        }

        // Extract metadata from request
        const metadata = {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            referer: req.get('Referer'),
        };

        const result = await analyticsService.trackEvent({
            eventType,
            eventData,
            sessionId,
            userId: req.user?._id || null,
            metadata,
            timestamp: new Date(),
        });

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, null, 'Event tracked successfully');
    } catch (error) {
        console.error('Error tracking analytics event:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get business analytics
 * @route   GET /api/analytics/business
 * @access  Private/Admin
 */
export const getBusinessAnalytics = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate && endDate) {
            dateRange.start = startDate;
            dateRange.end = endDate;
        }

        const result = await analyticsService.getBusinessAnalytics(dateRange);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.analytics, 'Business analytics retrieved successfully');
    } catch (error) {
        console.error('Error getting business analytics:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get real-time analytics
 * @route   GET /api/analytics/realtime
 * @access  Private/Admin
 */
export const getRealTimeAnalytics = asyncHandler(async (req, res) => {
    try {
        const result = await analyticsService.getRealTimeAnalytics();

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.realTime, 'Real-time analytics retrieved successfully');
    } catch (error) {
        console.error('Error getting real-time analytics:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Generate analytics report
 * @route   GET /api/analytics/report
 * @access  Private/Admin
 */
export const generateAnalyticsReport = asyncHandler(async (req, res) => {
    try {
        const { reportType = 'weekly', startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate && endDate) {
            dateRange.start = startDate;
            dateRange.end = endDate;
        }

        const result = await analyticsService.generateReport(reportType, dateRange);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.report, 'Analytics report generated successfully');
    } catch (error) {
        console.error('Error generating analytics report:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get stock alerts and inventory data
 * @route   GET /api/analytics/stock-alerts
 * @access  Private/Admin
 */
export const getStockAlerts = asyncHandler(async (req, res) => {
    try {
        const result = await analyticsService.getStockAlerts();

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.stockAlerts, 'Stock alerts retrieved successfully');
    } catch (error) {
        console.error('Error getting stock alerts:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get product trends and growth data
 * @route   GET /api/analytics/product-trends
 * @access  Private/Admin
 */
export const getProductTrends = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate && endDate) {
            dateRange.start = startDate;
            dateRange.end = endDate;
        }

        const result = await analyticsService.getProductTrends(dateRange);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.trends, 'Product trends retrieved successfully');
    } catch (error) {
        console.error('Error getting product trends:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get analytics dashboard data
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
export const getAnalyticsDashboard = asyncHandler(async (req, res) => {
    try {
        // Get data for last 30 days by default
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dateRange = {
            start: thirtyDaysAgo.toISOString(),
            end: new Date().toISOString(),
        };

        const [businessAnalytics, realTimeAnalytics] = await Promise.all([
            analyticsService.getBusinessAnalytics(dateRange),
            analyticsService.getRealTimeAnalytics(),
        ]);

        if (!businessAnalytics.success || !realTimeAnalytics.success) {
            return errorResponse(res, 'Failed to fetch analytics data', 500);
        }

        const dashboardData = {
            business: businessAnalytics.analytics,
            realTime: realTimeAnalytics.realTime,
            dateRange,
            lastUpdated: new Date().toISOString(),
        };

        return successResponse(res, dashboardData, 'Analytics dashboard data retrieved successfully');
    } catch (error) {
        console.error('Error getting analytics dashboard:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});
