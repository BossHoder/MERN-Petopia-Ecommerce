/**
 * Analytics Utility - Minimal Version with API Test
 */

import api from '../services/api';

class Analytics {
    constructor() {
        console.log('📊 Analytics constructor called');
        this.sessionId = this.getSessionId();
        this.userId = this.getUserId();
    }

    trackProductView(product) {
        console.log('📊 trackProductView called with:', product);
        try {
            // Send to backend
            this.sendAnalyticsEvent('product_view', {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                sku: product.sku,
            });
        } catch (error) {
            console.error('Analytics: Error tracking product view:', error);
        }
    }

    trackBeginCheckout(checkoutData) {
        console.log('📊 trackBeginCheckout called with:', checkoutData);
        try {
            // Send to backend
            this.sendAnalyticsEvent('begin_checkout', {
                checkout_data: checkoutData,
                items_count: checkoutData.items?.length || 0,
                total_value: checkoutData.total || 0,
            });
        } catch (error) {
            console.error('Analytics: Error tracking begin checkout:', error);
        }
    }

    trackRemoveFromCart(product) {
        console.log('📊 trackRemoveFromCart called with:', product);
        try {
            // Send to backend
            this.sendAnalyticsEvent('remove_from_cart', {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                quantity: product.quantity || 1,
            });
        } catch (error) {
            console.error('Analytics: Error tracking remove from cart:', error);
        }
    }

    trackAddToCart(product) {
        console.log('📊 trackAddToCart called with:', product);
        try {
            // Send to backend
            this.sendAnalyticsEvent('add_to_cart', {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                quantity: product.quantity || 1,
                variant: product.variantDisplayName,
            });
        } catch (error) {
            console.error('Analytics: Error tracking add to cart:', error);
        }
    }

    trackSearch(keyword, type, id) {
        console.log('📊 trackSearch called with:', keyword, type, id);
        try {
            // Send to backend
            this.sendAnalyticsEvent('search', {
                keyword,
                search_type: type,
                result_id: id,
            });
        } catch (error) {
            console.error('Analytics: Error tracking search:', error);
        }
    }

    trackPurchase(orderData) {
        console.log('📊 trackPurchase called with:', orderData);
        try {
            // Send to backend
            this.sendAnalyticsEvent('purchase', {
                order_id: orderData.orderId || orderData._id,
                total_value: orderData.total,
                items_count: orderData.items?.length || 0,
                payment_method: orderData.paymentMethod,
                shipping_method: orderData.shippingMethod,
            });
        } catch (error) {
            console.error('Analytics: Error tracking purchase:', error);
        }
    }

    async sendAnalyticsEvent(eventType, eventData) {
        try {
            const payload = {
                eventType,
                eventData: {
                    ...eventData,
                    session_id: this.sessionId,
                    user_id: this.userId,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                },
            };

            console.log('📊 Sending analytics event:', payload);
            await api.post('/api/analytics/track', payload);
        } catch (error) {
            console.warn('Analytics: Failed to send event to backend:', error.message);
        }
    }

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
}

// Export singleton instance
const analytics = new Analytics();

console.log('📊 Analytics instance created:', analytics);
console.log('📊 trackProductView method:', typeof analytics.trackProductView);
console.log('📊 trackAddToCart method:', typeof analytics.trackAddToCart);
console.log('📊 trackRemoveFromCart method:', typeof analytics.trackRemoveFromCart);
console.log('📊 trackBeginCheckout method:', typeof analytics.trackBeginCheckout);
console.log('📊 trackSearch method:', typeof analytics.trackSearch);
console.log('📊 trackPurchase method:', typeof analytics.trackPurchase);

export default analytics;
