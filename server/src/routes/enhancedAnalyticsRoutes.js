import express from 'express';
import enhancedAnalyticsController from '../controllers/enhancedAnalyticsController.js';
import requireJwtAuth from '../middleware/requireJwtAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

/**
 * Enhanced Analytics Routes
 * Advanced analytics endpoints with A/B testing, customer journey tracking,
 * and predictive analytics capabilities
 */

// Public routes (no authentication required)
router.post('/track', enhancedAnalyticsController.trackEvent);
router.get('/ab-test/:testId', enhancedAnalyticsController.getABTestVariant);

// Protected routes (authentication required)
router.use(requireJwtAuth);

// Customer-specific analytics
router.get('/customer-insights/:userId', enhancedAnalyticsController.getCustomerInsights);
router.get('/recommendations/:userId', enhancedAnalyticsController.getProductRecommendations);
router.get('/customer-ltv/:userId', enhancedAnalyticsController.getCustomerLTV);
router.get('/churn-prediction/:userId', enhancedAnalyticsController.getChurnPrediction);
router.get('/customer-journey/:userId/:sessionId', enhancedAnalyticsController.getCustomerJourney);

// Admin-only routes
router.use(requireAdmin);

// Business intelligence
router.get('/business-intelligence', enhancedAnalyticsController.getBusinessIntelligence);
router.get('/ltv-analysis', enhancedAnalyticsController.getLTVAnalysis);
router.get('/churn-analysis', enhancedAnalyticsController.getChurnAnalysis);
router.get('/journey-analytics', enhancedAnalyticsController.getJourneyAnalytics);
router.get('/real-time-activity', enhancedAnalyticsController.getRealTimeActivity);

// A/B Testing management
router.post('/ab-test', enhancedAnalyticsController.createABTest);

export default router;
