import enhancedAnalyticsService from '../services/enhancedAnalyticsService.js';
import { successResponse, errorResponse, analyticsResponse } from '../helpers/responseHelper.js';

/**
 * Enhanced Analytics Controller
 * Handles advanced analytics endpoints including A/B testing, customer journey,
 * and predictive analytics
 */
class EnhancedAnalyticsController {
    /**
     * Track enhanced analytics event
     */
    async trackEvent(req, res) {
        try {
            const eventData = {
                ...req.body,
                userId: req.user?.id || null,
                sessionId: req.body.sessionId,
            };

            const result = await enhancedAnalyticsService.trackEvent(eventData);

            if (result.success) {
                return successResponse(res, result.event, 'Event tracked successfully');
            } else {
                return errorResponse(res, result.error, 400);
            }
        } catch (error) {
            console.error('Error in trackEvent:', error);
            return errorResponse(res, 'Failed to track event', 500);
        }
    }

    /**
     * Get business intelligence dashboard
     */
    async getBusinessIntelligence(req, res) {
        try {
            const { start, end } = req.query;
            const dateRange = start && end ? { start, end } : {};

            const result = await enhancedAnalyticsService.getBusinessIntelligence(dateRange);

            if (result.success) {
                return analyticsResponse(res, result.intelligence, 'Business intelligence retrieved successfully');
            } else {
                return errorResponse(res, result.error, 400);
            }
        } catch (error) {
            console.error('Error in getBusinessIntelligence:', error);
            return errorResponse(res, 'Failed to get business intelligence', 500);
        }
    }

    /**
     * Get customer LTV prediction
     */
    async getCustomerLTV(req, res) {
        try {
            const { userId } = req.params;
            const result = await enhancedAnalyticsService.predictCustomerLTV(userId);

            return successResponse(res, result, 'Customer LTV prediction retrieved successfully');
        } catch (error) {
            console.error('Error in getCustomerLTV:', error);
            return errorResponse(res, 'Failed to get customer LTV', 500);
        }
    }

    /**
     * Get churn prediction
     */
    async getChurnPrediction(req, res) {
        try {
            const { userId } = req.params;
            const result = await enhancedAnalyticsService.predictChurn(userId);

            return successResponse(res, result, 'Churn prediction retrieved successfully');
        } catch (error) {
            console.error('Error in getChurnPrediction:', error);
            return errorResponse(res, 'Failed to get churn prediction', 500);
        }
    }

    /**
     * Get product recommendations
     */
    async getProductRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 5 } = req.query;

            const result = await enhancedAnalyticsService.getProductRecommendations(userId, parseInt(limit));

            if (result.success) {
                return successResponse(res, result, 'Product recommendations retrieved successfully');
            } else {
                return errorResponse(res, result.error, 400);
            }
        } catch (error) {
            console.error('Error in getProductRecommendations:', error);
            return errorResponse(res, 'Failed to get product recommendations', 500);
        }
    }

    /**
     * Create A/B test
     */
    async createABTest(req, res) {
        try {
            const testData = {
                ...req.body,
                createdBy: req.user.id,
            };

            const result = await enhancedAnalyticsService.createABTest(testData);

            if (result.success) {
                return successResponse(res, result.test, 'A/B test created successfully');
            } else {
                return errorResponse(res, result.error, 400);
            }
        } catch (error) {
            console.error('Error in createABTest:', error);
            return errorResponse(res, 'Failed to create A/B test', 500);
        }
    }

    /**
     * Get A/B test variant for user
     */
    async getABTestVariant(req, res) {
        try {
            const { testId } = req.params;
            const userId = req.user?.id || req.query.userId || 'anonymous';

            const result = await enhancedAnalyticsService.getABTestVariant(testId, userId);

            return successResponse(res, result, 'A/B test variant retrieved successfully');
        } catch (error) {
            console.error('Error in getABTestVariant:', error);
            return errorResponse(res, 'Failed to get A/B test variant', 500);
        }
    }

    /**
     * Get customer journey
     */
    async getCustomerJourney(req, res) {
        try {
            const { userId, sessionId } = req.params;
            
            // Import CustomerJourney model
            const CustomerJourney = (await import('../models/CustomerJourney.js')).default;
            
            const journey = await CustomerJourney.findOne({ userId, sessionId });

            if (!journey) {
                return errorResponse(res, 'Customer journey not found', 404);
            }

            return successResponse(res, journey, 'Customer journey retrieved successfully');
        } catch (error) {
            console.error('Error in getCustomerJourney:', error);
            return errorResponse(res, 'Failed to get customer journey', 500);
        }
    }

    /**
     * Get customer journey analytics
     */
    async getJourneyAnalytics(req, res) {
        try {
            const { start, end } = req.query;
            const dateRange = start && end ? { start, end } : {};

            // Import CustomerJourney model
            const CustomerJourney = (await import('../models/CustomerJourney.js')).default;

            const [conversionPaths, journeyStages] = await Promise.all([
                CustomerJourney.getConversionPaths(dateRange),
                CustomerJourney.getJourneyStages(dateRange),
            ]);

            const analytics = {
                conversionPaths,
                journeyStages,
                dateRange,
                generatedAt: new Date().toISOString(),
            };

            return analyticsResponse(res, analytics, 'Journey analytics retrieved successfully');
        } catch (error) {
            console.error('Error in getJourneyAnalytics:', error);
            return errorResponse(res, 'Failed to get journey analytics', 500);
        }
    }

    /**
     * Get LTV analysis
     */
    async getLTVAnalysis(req, res) {
        try {
            const { start, end } = req.query;
            const dateRange = start && end ? { start, end } : {};

            const result = await enhancedAnalyticsService.getLTVAnalysis(dateRange);

            return analyticsResponse(res, result, 'LTV analysis retrieved successfully');
        } catch (error) {
            console.error('Error in getLTVAnalysis:', error);
            return errorResponse(res, 'Failed to get LTV analysis', 500);
        }
    }

    /**
     * Get churn analysis
     */
    async getChurnAnalysis(req, res) {
        try {
            const { start, end } = req.query;
            const dateRange = start && end ? { start, end } : {};

            const result = await enhancedAnalyticsService.getChurnAnalysis(dateRange);

            return analyticsResponse(res, result, 'Churn analysis retrieved successfully');
        } catch (error) {
            console.error('Error in getChurnAnalysis:', error);
            return errorResponse(res, 'Failed to get churn analysis', 500);
        }
    }

    /**
     * Get customer insights
     */
    async getCustomerInsights(req, res) {
        try {
            const { userId } = req.params;

            const [ltv, churn, recommendations] = await Promise.all([
                enhancedAnalyticsService.predictCustomerLTV(userId),
                enhancedAnalyticsService.predictChurn(userId),
                enhancedAnalyticsService.getProductRecommendations(userId, 5),
            ]);

            const insights = {
                ltv,
                churn,
                recommendations: recommendations.success ? recommendations.recommendations : [],
                generatedAt: new Date().toISOString(),
            };

            return successResponse(res, insights, 'Customer insights retrieved successfully');
        } catch (error) {
            console.error('Error in getCustomerInsights:', error);
            return errorResponse(res, 'Failed to get customer insights', 500);
        }
    }

    /**
     * Get real-time customer activity
     */
    async getRealTimeActivity(req, res) {
        try {
            // Import CustomerJourney model
            const CustomerJourney = (await import('../models/CustomerJourney.js')).default;

            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

            const activeJourneys = await CustomerJourney.find({
                lastActivity: { $gte: thirtyMinutesAgo },
            })
                .sort({ lastActivity: -1 })
                .limit(20)
                .select('userId sessionId lastActivity journeyStage touchpoints');

            const realTimeData = {
                activeJourneys,
                activeUsers: activeJourneys.length,
                lastUpdated: new Date().toISOString(),
            };

            return successResponse(res, realTimeData, 'Real-time activity retrieved successfully');
        } catch (error) {
            console.error('Error in getRealTimeActivity:', error);
            return errorResponse(res, 'Failed to get real-time activity', 500);
        }
    }
}

export default new EnhancedAnalyticsController();