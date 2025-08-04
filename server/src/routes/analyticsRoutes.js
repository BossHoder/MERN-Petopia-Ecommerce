import express from 'express';
import requireJwtAuth from '../middleware/requireJwtAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
    trackEvent,
    getBusinessAnalytics,
    getRealTimeAnalytics,
    generateAnalyticsReport,
    getAnalyticsDashboard,
    getStockAlerts,
    getProductTrends,
} from '../controllers/analyticsController.js';

const router = express.Router();

// ===========================================
// PUBLIC ROUTES (for tracking events)
// ===========================================

/**
 * @desc    Track analytics event
 * @route   POST /api/analytics/track
 * @access  Public (for tracking user interactions)
 */
router.post('/track', trackEvent);

// ===========================================
// ADMIN ROUTES (protected)
// ===========================================

/**
 * @desc    Get analytics dashboard data
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
router.get('/dashboard', requireJwtAuth, requireAdmin, getAnalyticsDashboard);

/**
 * @desc    Get business analytics
 * @route   GET /api/analytics/business
 * @access  Private/Admin
 */
router.get('/business', requireJwtAuth, requireAdmin, getBusinessAnalytics);

/**
 * @desc    Get real-time analytics
 * @route   GET /api/analytics/realtime
 * @access  Private/Admin
 */
router.get('/realtime', requireJwtAuth, requireAdmin, getRealTimeAnalytics);

/**
 * @desc    Generate analytics report
 * @route   GET /api/analytics/report
 * @access  Private/Admin
 */
router.get('/report', requireJwtAuth, requireAdmin, generateAnalyticsReport);

/**
 * @desc    Get stock alerts and inventory data
 * @route   GET /api/analytics/stock-alerts
 * @access  Private/Admin
 */
router.get('/stock-alerts', requireJwtAuth, requireAdmin, getStockAlerts);

/**
 * @desc    Get product trends and growth data
 * @route   GET /api/analytics/product-trends
 * @access  Private/Admin
 */
router.get('/product-trends', requireJwtAuth, requireAdmin, getProductTrends);

// ===========================================
// DEBUG ROUTES (TEMPORARY - REMOVE IN PRODUCTION)
// ===========================================

/**
 * @desc    Debug business analytics (no auth required)
 * @route   GET /api/analytics/debug-business
 * @access  Public (FOR DEBUGGING ONLY)
 */
router.get('/debug-business', getBusinessAnalytics);

export default router;
