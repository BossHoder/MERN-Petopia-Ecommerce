import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import ABTest from '../models/ABTest.js';
import CustomerJourney from '../models/CustomerJourney.js';

/**
 * Enhanced Analytics Service
 * Modern analytics implementation with A/B testing, customer journey tracking,
 * and predictive analytics capabilities
 */
class EnhancedAnalyticsService {
    constructor() {
        this.externalAnalytics = this.initializeExternalAnalytics();
    }

    /**
     * Initialize external analytics services
     */
    initializeExternalAnalytics() {
        return {
            mixpanel: process.env.MIXPANEL_TOKEN ? require('mixpanel').init(process.env.MIXPANEL_TOKEN) : null,
            amplitude: process.env.AMPLITUDE_API_KEY ? require('@amplitude/analytics-node').init(process.env.AMPLITUDE_API_KEY) : null,
            segment: process.env.SEGMENT_WRITE_KEY ? require('@segment/analytics-node')(process.env.SEGMENT_WRITE_KEY) : null,
        };
    }

    /**
     * Enhanced event tracking with multiple analytics platforms
     */
    async trackEvent(eventData) {
        try {
            // Track with internal analytics
            const event = new AnalyticsEvent(eventData);
            await event.save();

            // Track with external analytics platforms
            await this.trackWithExternalServices(eventData);

            // Update customer journey
            await this.updateCustomerJourney(eventData);

            return {
                success: true,
                event,
                externalTracking: true,
            };
        } catch (error) {
            console.error('Error tracking enhanced analytics event:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Track events with external analytics services
     */
    async trackWithExternalServices(eventData) {
        const { userId, eventType, eventData: data } = eventData;

        // Mixpanel tracking
        if (this.externalAnalytics.mixpanel) {
            this.externalAnalytics.mixpanel.track(eventType, {
                distinct_id: userId || 'anonymous',
                ...data,
                timestamp: new Date().toISOString(),
            });
        }

        // Amplitude tracking
        if (this.externalAnalytics.amplitude) {
            this.externalAnalytics.amplitude.track({
                event_type: eventType,
                user_id: userId || 'anonymous',
                event_properties: data,
                time: Date.now(),
            });
        }

        // Segment tracking
        if (this.externalAnalytics.segment) {
            this.externalAnalytics.segment.track({
                event: eventType,
                userId: userId || 'anonymous',
                properties: data,
                timestamp: new Date(),
            });
        }
    }

    /**
     * A/B Testing functionality
     */
    async createABTest(testData) {
        try {
            const test = new ABTest(testData);
            await test.save();

            return {
                success: true,
                test,
            };
        } catch (error) {
            console.error('Error creating A/B test:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get A/B test variant for user
     */
    async getABTestVariant(testId, userId) {
        try {
            const test = await ABTest.findById(testId);
            if (!test || !test.isActive) {
                return { variant: 'control' };
            }

            // Simple hash-based assignment
            const hash = this.hashString(userId + testId);
            const variantIndex = hash % test.variants.length;
            
            return {
                variant: test.variants[variantIndex],
                testId,
            };
        } catch (error) {
            console.error('Error getting A/B test variant:', error);
            return { variant: 'control' };
        }
    }

    /**
     * Customer Journey Tracking
     */
    async updateCustomerJourney(eventData) {
        try {
            const { userId, sessionId, eventType, eventData: data } = eventData;

            let journey = await CustomerJourney.findOne({
                userId: userId || 'anonymous',
                sessionId,
            });

            if (!journey) {
                journey = new CustomerJourney({
                    userId: userId || 'anonymous',
                    sessionId,
                    touchpoints: [],
                    startTime: new Date(),
                });
            }

            journey.touchpoints.push({
                eventType,
                timestamp: new Date(),
                data,
                page: data.url || null,
            });

            journey.lastActivity = new Date();
            await journey.save();

            return {
                success: true,
                journey,
            };
        } catch (error) {
            console.error('Error updating customer journey:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Predictive Analytics - Customer Lifetime Value
     */
    async predictCustomerLTV(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's order history
            const orders = await Order.find({ user: userId, status: { $nin: ['cancelled', 'refunded'] } });
            
            if (orders.length === 0) {
                return {
                    predictedLTV: 0,
                    confidence: 0,
                    factors: ['No purchase history'],
                };
            }

            // Calculate basic metrics
            const totalSpent = orders.reduce((sum, order) => sum + order.pricing.total, 0);
            const averageOrderValue = totalSpent / orders.length;
            const orderFrequency = orders.length / Math.max(1, (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24 * 30)); // orders per month

            // Simple predictive model
            const predictedLTV = averageOrderValue * orderFrequency * 12; // 12 months
            const confidence = Math.min(0.95, orders.length / 10); // Higher confidence with more orders

            return {
                predictedLTV: Math.round(predictedLTV),
                confidence: Math.round(confidence * 100),
                factors: [
                    `Average Order Value: ${averageOrderValue.toFixed(2)}`,
                    `Order Frequency: ${orderFrequency.toFixed(2)} orders/month`,
                    `Total Orders: ${orders.length}`,
                ],
            };
        } catch (error) {
            console.error('Error predicting customer LTV:', error);
            return {
                predictedLTV: 0,
                confidence: 0,
                factors: ['Error in prediction'],
            };
        }
    }

    /**
     * Churn Prediction
     */
    async predictChurn(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const lastOrder = await Order.findOne({ user: userId })
                .sort({ createdAt: -1 });

            if (!lastOrder) {
                return {
                    churnRisk: 'high',
                    probability: 0.8,
                    factors: ['No purchase history'],
                };
            }

            const daysSinceLastOrder = (Date.now() - lastOrder.createdAt) / (1000 * 60 * 60 * 24);
            const totalOrders = await Order.countDocuments({ user: userId });

            // Simple churn prediction model
            let churnProbability = 0;
            let factors = [];

            if (daysSinceLastOrder > 90) {
                churnProbability += 0.4;
                factors.push('No orders in 90+ days');
            } else if (daysSinceLastOrder > 30) {
                churnProbability += 0.2;
                factors.push('No orders in 30+ days');
            }

            if (totalOrders === 1) {
                churnProbability += 0.3;
                factors.push('One-time customer');
            }

            const churnRisk = churnProbability > 0.6 ? 'high' : churnProbability > 0.3 ? 'medium' : 'low';

            return {
                churnRisk,
                probability: Math.round(churnProbability * 100),
                factors,
                daysSinceLastOrder: Math.round(daysSinceLastOrder),
                totalOrders,
            };
        } catch (error) {
            console.error('Error predicting churn:', error);
            return {
                churnRisk: 'unknown',
                probability: 0,
                factors: ['Error in prediction'],
            };
        }
    }

    /**
     * Product Recommendation Engine
     */
    async getProductRecommendations(userId, limit = 5) {
        try {
            // Get user's purchase history
            const userOrders = await Order.find({ user: userId, status: { $nin: ['cancelled', 'refunded'] } });
            const purchasedProducts = userOrders.flatMap(order => order.items.map(item => item.product.toString()));

            // Get products in same categories
            const userProducts = await Product.find({ _id: { $in: purchasedProducts } });
            const categories = [...new Set(userProducts.map(p => p.category))];

            // Find similar products
            const recommendations = await Product.find({
                _id: { $nin: purchasedProducts },
                category: { $in: categories },
                isPublished: true,
            })
                .sort({ rating: -1, salesCount: -1 })
                .limit(limit)
                .select('name price images category rating salesCount');

            return {
                success: true,
                recommendations,
                algorithm: 'category-based',
            };
        } catch (error) {
            console.error('Error getting product recommendations:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Advanced Business Intelligence
     */
    async getBusinessIntelligence(dateRange = {}) {
        try {
            const [basicAnalytics, ltvAnalysis, churnAnalysis, recommendations] = await Promise.all([
                this.getBusinessAnalytics(dateRange),
                this.getLTVAnalysis(dateRange),
                this.getChurnAnalysis(dateRange),
                this.getTopRecommendations(),
            ]);

            return {
                success: true,
                intelligence: {
                    basic: basicAnalytics,
                    customerLTV: ltvAnalysis,
                    churn: churnAnalysis,
                    recommendations,
                    generatedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Error getting business intelligence:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * LTV Analysis
     */
    async getLTVAnalysis(dateRange = {}) {
        try {
            const customers = await User.find({ role: 'USER', ...dateRange });
            const ltvData = await Promise.all(
                customers.map(async (customer) => {
                    const ltv = await this.predictCustomerLTV(customer._id);
                    return {
                        userId: customer._id,
                        email: customer.email,
                        ltv: ltv.predictedLTV,
                        confidence: ltv.confidence,
                    };
                })
            );

            const averageLTV = ltvData.reduce((sum, data) => sum + data.ltv, 0) / ltvData.length;
            const highValueCustomers = ltvData.filter(data => data.ltv > averageLTV * 2);

            return {
                averageLTV: Math.round(averageLTV),
                highValueCustomers: highValueCustomers.length,
                totalCustomers: ltvData.length,
                ltvDistribution: this.calculateLTVDistribution(ltvData),
            };
        } catch (error) {
            console.error('Error getting LTV analysis:', error);
            return {
                averageLTV: 0,
                highValueCustomers: 0,
                totalCustomers: 0,
                ltvDistribution: {},
            };
        }
    }

    /**
     * Churn Analysis
     */
    async getChurnAnalysis(dateRange = {}) {
        try {
            const customers = await User.find({ role: 'USER', ...dateRange });
            const churnData = await Promise.all(
                customers.map(async (customer) => {
                    const churn = await this.predictChurn(customer._id);
                    return {
                        userId: customer._id,
                        email: customer.email,
                        churnRisk: churn.churnRisk,
                        probability: churn.probability,
                    };
                })
            );

            const highRiskCustomers = churnData.filter(data => data.churnRisk === 'high');
            const mediumRiskCustomers = churnData.filter(data => data.churnRisk === 'medium');

            return {
                highRiskCustomers: highRiskCustomers.length,
                mediumRiskCustomers: mediumRiskCustomers.length,
                totalCustomers: churnData.length,
                averageChurnRisk: this.calculateAverageChurnRisk(churnData),
            };
        } catch (error) {
            console.error('Error getting churn analysis:', error);
            return {
                highRiskCustomers: 0,
                mediumRiskCustomers: 0,
                totalCustomers: 0,
                averageChurnRisk: 0,
            };
        }
    }

    /**
     * Get top recommendations
     */
    async getTopRecommendations() {
        try {
            const topProducts = await Product.find({ isPublished: true })
                .sort({ rating: -1, salesCount: -1 })
                .limit(10)
                .select('name price images category rating salesCount');

            return {
                topProducts,
                algorithm: 'popularity-based',
            };
        } catch (error) {
            console.error('Error getting top recommendations:', error);
            return {
                topProducts: [],
                algorithm: 'popularity-based',
            };
        }
    }

    /**
     * Utility methods
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    calculateLTVDistribution(ltvData) {
        const distribution = {
            low: 0,
            medium: 0,
            high: 0,
        };

        const values = ltvData.map(data => data.ltv);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

        ltvData.forEach(data => {
            if (data.ltv < avg * 0.5) distribution.low++;
            else if (data.ltv > avg * 1.5) distribution.high++;
            else distribution.medium++;
        });

        return distribution;
    }

    calculateAverageChurnRisk(churnData) {
        const totalRisk = churnData.reduce((sum, data) => sum + data.probability, 0);
        return Math.round(totalRisk / churnData.length);
    }

    // Inherit basic analytics methods
    async getBusinessAnalytics(dateRange = {}) {
        // Import and use the basic analytics service
        const basicAnalyticsService = (await import('./analyticsService.js')).default;
        return await basicAnalyticsService.getBusinessAnalytics(dateRange);
    }
}

export default new EnhancedAnalyticsService();