/**
 * Enhanced Analytics Utility
 * Modern analytics implementation with A/B testing, customer journey tracking,
 * and advanced event tracking capabilities
 */

import api from '../services/api';

/* global gtag */

class EnhancedAnalytics {
    constructor() {
        this.sessionId = this.getSessionId();
        this.userId = this.getUserId();
        this.externalAnalytics = this.initializeExternalAnalytics();
        this.abTests = new Map();
        this.journeyData = {
            startTime: Date.now(),
            touchpoints: [],
            currentStage: 'awareness',
        };
    }

    /**
     * Initialize external analytics services
     */
    initializeExternalAnalytics() {
        return {
            mixpanel: window.mixpanel || null,
            amplitude: window.amplitude || null,
            segment: window.analytics || null,
            hotjar: window.hj || null,
        };
    }

    /**
     * Enhanced product view tracking
     */
    trackProductView(product, additionalData = {}) {
        console.log('📊 Enhanced tracking product view:', product?.name);
        
        try {
            // Basic GA4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'view_item', {
                    currency: 'VND',
                    value: product.price,
                    items: [
                        {
                            item_id: product._id || product.id,
                            item_name: product.name,
                            category: product.category,
                            price: product.price,
                            item_brand: product.brand,
                        },
                    ],
                });
            }

            // Enhanced event data
            const eventData = {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                sku: product.sku,
                ...additionalData,
            };

            // Track with multiple platforms
            this.trackWithExternalServices('product_view', eventData);
            this.sendEnhancedAnalyticsEvent('product_view', eventData);
            this.updateCustomerJourney('product_view', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking product view:', error);
        }
    }

    /**
     * Enhanced add to cart tracking
     */
    trackAddToCart(product, additionalData = {}) {
        console.log('📊 Enhanced tracking add to cart:', product?.name);
        
        try {
            // GA4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'add_to_cart', {
                    currency: 'VND',
                    value: product.price * product.quantity,
                    items: [
                        {
                            item_id: product._id || product.id,
                            item_name: product.name,
                            category: product.category,
                            quantity: product.quantity,
                            price: product.price,
                            item_brand: product.brand,
                            item_variant: product.variantDisplayName,
                        },
                    ],
                });
            }

            const eventData = {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                quantity: product.quantity,
                variant_id: product.variantId,
                variant_name: product.variantDisplayName,
                sku: product.sku,
                ...additionalData,
            };

            this.trackWithExternalServices('add_to_cart', eventData);
            this.sendEnhancedAnalyticsEvent('add_to_cart', eventData);
            this.updateCustomerJourney('add_to_cart', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking add to cart:', error);
        }
    }

    /**
     * Enhanced purchase tracking
     */
    trackPurchase(purchaseData, additionalData = {}) {
        console.log('📊 Enhanced tracking purchase:', purchaseData?.transaction_id);
        
        try {
            // GA4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'purchase', {
                    transaction_id: purchaseData.transaction_id,
                    value: purchaseData.value,
                    currency: purchaseData.currency || 'VND',
                    coupon: purchaseData.coupon,
                    shipping: purchaseData.shipping,
                    tax: purchaseData.tax,
                    items: purchaseData.items.map((item) => ({
                        item_id: item._id || item.id,
                        item_name: item.name,
                        category: item.category,
                        quantity: item.quantity,
                        price: item.price,
                        item_brand: item.brand,
                        item_variant: item.variantDisplayName,
                    })),
                });
            }

            const eventData = {
                transaction_id: purchaseData.transaction_id,
                total_value: purchaseData.value,
                currency: purchaseData.currency || 'VND',
                coupon_code: purchaseData.coupon,
                shipping_cost: purchaseData.shipping,
                tax_amount: purchaseData.tax,
                discount_amount: purchaseData.discount,
                item_count: purchaseData.items.length,
                total_quantity: purchaseData.items.reduce((sum, item) => sum + item.quantity, 0),
                purchased_items: purchaseData.items.map((item) => ({
                    product_id: item._id || item.id,
                    product_name: item.name,
                    category: item.category,
                    brand: item.brand,
                    price: item.price,
                    quantity: item.quantity,
                    variant_id: item.variantId,
                    variant_name: item.variantDisplayName,
                })),
                ...additionalData,
            };

            this.trackWithExternalServices('purchase', eventData);
            this.sendEnhancedAnalyticsEvent('purchase', eventData);
            this.updateCustomerJourney('purchase', eventData);
            this.markJourneyAsConverted(eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking purchase:', error);
        }
    }

    /**
     * Enhanced search tracking
     */
    trackSearch(searchTerm, results = null, additionalData = {}) {
        console.log('📊 Enhanced tracking search:', searchTerm);
        
        try {
            // GA4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'search', {
                    search_term: searchTerm,
                    search_results: results?.length || 0,
                });
            }

            const eventData = {
                search_term: searchTerm,
                search_results_count: results?.length || 0,
                search_results: results?.slice(0, 5) || [], // Limit to first 5 results
                ...additionalData,
            };

            this.trackWithExternalServices('search', eventData);
            this.sendEnhancedAnalyticsEvent('search', eventData);
            this.updateCustomerJourney('search', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking search:', error);
        }
    }

    /**
     * Track page views with enhanced data
     */
    trackPageView(pageData = {}) {
        try {
            const eventData = {
                page_url: window.location.href,
                page_title: document.title,
                referrer: document.referrer,
                ...pageData,
            };

            this.trackWithExternalServices('page_view', eventData);
            this.sendEnhancedAnalyticsEvent('page_view', eventData);
            this.updateCustomerJourney('page_view', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking page view:', error);
        }
    }

    /**
     * Track user engagement
     */
    trackEngagement(engagementType, data = {}) {
        try {
            const eventData = {
                engagement_type: engagementType,
                engagement_duration: data.duration || 0,
                engagement_depth: data.depth || 0,
                ...data,
            };

            this.trackWithExternalServices('engagement', eventData);
            this.sendEnhancedAnalyticsEvent('engagement', eventData);
            this.updateCustomerJourney('engagement', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking engagement:', error);
        }
    }

    /**
     * A/B Testing functionality
     */
    async getABTestVariant(testId) {
        try {
            if (this.abTests.has(testId)) {
                return this.abTests.get(testId);
            }

            const response = await api.get(`/api/enhanced-analytics/ab-test/${testId}`, {
                params: { userId: this.userId },
            });

            if (response.data.success) {
                this.abTests.set(testId, response.data.data.variant);
                return response.data.data.variant;
            }

            return 'control';
        } catch (error) {
            console.error('Enhanced Analytics: Error getting A/B test variant:', error);
            return 'control';
        }
    }

    /**
     * Track A/B test exposure
     */
    trackABTestExposure(testId, variant, additionalData = {}) {
        try {
            const eventData = {
                test_id: testId,
                variant: variant,
                ...additionalData,
            };

            this.trackWithExternalServices('ab_test_exposure', eventData);
            this.sendEnhancedAnalyticsEvent('ab_test_exposure', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking A/B test exposure:', error);
        }
    }

    /**
     * Track with external analytics services
     */
    trackWithExternalServices(eventType, eventData) {
        const userId = this.userId || 'anonymous';

        // Mixpanel
        if (this.externalAnalytics.mixpanel) {
            this.externalAnalytics.mixpanel.track(eventType, {
                distinct_id: userId,
                ...eventData,
                timestamp: new Date().toISOString(),
            });
        }

        // Amplitude
        if (this.externalAnalytics.amplitude) {
            this.externalAnalytics.amplitude.track(eventType, {
                user_id: userId,
                event_properties: eventData,
                time: Date.now(),
            });
        }

        // Segment
        if (this.externalAnalytics.segment) {
            this.externalAnalytics.segment.track(eventType, {
                userId: userId,
                properties: eventData,
                timestamp: new Date(),
            });
        }

        // Hotjar
        if (this.externalAnalytics.hotjar && eventType === 'purchase') {
            this.externalAnalytics.hotjar('event', {
                id: 'purchase',
                value: eventData.total_value,
            });
        }
    }

    /**
     * Send enhanced analytics event to backend
     */
    async sendEnhancedAnalyticsEvent(eventType, eventData) {
        try {
            const payload = {
                eventType,
                sessionId: this.sessionId,
                eventData: {
                    ...eventData,
                    user_id: this.userId,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    screen_resolution: `${screen.width}x${screen.height}`,
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            };

            await api.post('/api/enhanced-analytics/track', payload);
        } catch (error) {
            console.warn('Enhanced Analytics: Failed to send event to backend:', error.message);
        }
    }

    /**
     * Update customer journey
     */
    updateCustomerJourney(eventType, eventData) {
        this.journeyData.touchpoints.push({
            eventType,
            timestamp: new Date().toISOString(),
            data: eventData,
            page: window.location.href,
        });

        // Update journey stage
        this.updateJourneyStage(eventType);

        // Store journey data in session storage
        sessionStorage.setItem('customer_journey', JSON.stringify(this.journeyData));
    }

    /**
     * Update journey stage based on events
     */
    updateJourneyStage(eventType) {
        switch (eventType) {
            case 'purchase':
                this.journeyData.currentStage = 'purchase';
                break;
            case 'add_to_cart':
            case 'checkout_started':
                this.journeyData.currentStage = 'consideration';
                break;
            case 'product_view':
            case 'search':
                if (this.journeyData.currentStage === 'awareness') {
                    this.journeyData.currentStage = 'awareness';
                }
                break;
        }
    }

    /**
     * Mark journey as converted
     */
    markJourneyAsConverted(eventData) {
        this.journeyData.isConverted = true;
        this.journeyData.conversionEvent = {
            eventType: 'purchase',
            timestamp: new Date().toISOString(),
            value: eventData.total_value,
        };
        this.journeyData.currentStage = 'purchase';
    }

    /**
     * Get customer insights
     */
    async getCustomerInsights() {
        try {
            if (!this.userId) {
                return null;
            }

            const response = await api.get(`/api/enhanced-analytics/customer-insights/${this.userId}`);
            
            if (response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error('Enhanced Analytics: Error getting customer insights:', error);
            return null;
        }
    }

    /**
     * Get product recommendations
     */
    async getProductRecommendations(limit = 5) {
        try {
            if (!this.userId) {
                return [];
            }

            const response = await api.get(`/api/enhanced-analytics/recommendations/${this.userId}`, {
                params: { limit },
            });

            if (response.data.success) {
                return response.data.data.recommendations;
            }

            return [];
        } catch (error) {
            console.error('Enhanced Analytics: Error getting recommendations:', error);
            return [];
        }
    }

    /**
     * Track performance metrics
     */
    trackPerformance(metrics) {
        try {
            const eventData = {
                load_time: metrics.loadTime,
                first_contentful_paint: metrics.fcp,
                largest_contentful_paint: metrics.lcp,
                first_input_delay: metrics.fid,
                cumulative_layout_shift: metrics.cls,
                ...metrics,
            };

            this.trackWithExternalServices('performance', eventData);
            this.sendEnhancedAnalyticsEvent('performance', eventData);

        } catch (error) {
            console.error('Enhanced Analytics: Error tracking performance:', error);
        }
    }

    /**
     * Track error events
     */
    trackError(error, context = {}) {
        try {
            const eventData = {
                error_message: error.message,
                error_stack: error.stack,
                error_type: error.name,
                context,
            };

            this.trackWithExternalServices('error', eventData);
            this.sendEnhancedAnalyticsEvent('error', eventData);

        } catch (err) {
            console.error('Enhanced Analytics: Error tracking error:', err);
        }
    }

    /**
     * Utility methods
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.id || null;
        } catch {
            return null;
        }
    }

    /**
     * Initialize enhanced analytics
     */
    init() {
        // Track initial page view
        this.trackPageView();

        // Track performance metrics when available
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        this.trackPerformance({
                            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        });
                    }
                }, 1000);
            });
        }

        // Track errors
        window.addEventListener('error', (event) => {
            this.trackError(event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(new Error(event.reason), {
                type: 'unhandledrejection',
            });
        });

        console.log('🚀 Enhanced Analytics initialized');
    }
}

// Export singleton instance
const enhancedAnalytics = new EnhancedAnalytics();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhancedAnalytics.init());
} else {
    enhancedAnalytics.init();
}

export default enhancedAnalytics;