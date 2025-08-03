/**
 * Analytics Utility - Fixed Version
 * Handles tracking for both Google Analytics 4 and custom backend analytics
 */

import api from '../services/api';

/* global gtag */

class Analytics {
    constructor() {
        this.sessionId = this.getSessionId();
        this.userId = this.getUserId();
    }

    trackProductView(product) {
        console.log('📊 Tracking product view:', product?.name);
        try {
            // Track with GA4
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

            // Track with backend
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

    trackAddToCart(product) {
        console.log('📊 Tracking add to cart:', product?.name);
        try {
            // Track with GA4
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

            // Track with backend
            this.sendAnalyticsEvent('add_to_cart', {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                quantity: product.quantity,
                variant_id: product.variantId,
                variant_name: product.variantDisplayName,
                sku: product.sku,
            });
        } catch (error) {
            console.error('Analytics: Error tracking add to cart:', error);
        }
    }

    trackRemoveFromCart(product) {
        console.log('📊 Tracking remove from cart:', product?.name);
        try {
            // Track with GA4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'remove_from_cart', {
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

            // Track with backend
            this.sendAnalyticsEvent('remove_from_cart', {
                product_id: product._id || product.id,
                product_name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                quantity: product.quantity,
                variant_id: product.variantId,
                variant_name: product.variantDisplayName,
                sku: product.sku,
            });
        } catch (error) {
            console.error('Analytics: Error tracking remove from cart:', error);
        }
    }

    trackBeginCheckout(cartItems) {
        console.log('📊 Tracking begin checkout with', cartItems?.length, 'items');
        try {
            const totalValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Track with GA4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: 'VND',
                    value: totalValue,
                    items: cartItems.map((item) => ({
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

            // Track with backend
            this.sendAnalyticsEvent('begin_checkout', {
                total_value: totalValue,
                currency: 'VND',
                item_count: cartItems.length,
                total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                cart_items: cartItems.map((item) => ({
                    product_id: item._id || item.id,
                    product_name: item.name,
                    category: item.category,
                    brand: item.brand,
                    price: item.price,
                    quantity: item.quantity,
                    variant_id: item.variantId,
                    variant_name: item.variantDisplayName,
                })),
            });
        } catch (error) {
            console.error('Analytics: Error tracking begin checkout:', error);
        }
    }

    trackPurchase(purchaseData) {
        console.log('📊 Tracking purchase:', purchaseData?.transaction_id);
        try {
            // Track with GA4
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

            // Track with backend
            this.sendAnalyticsEvent('purchase', {
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
            });
        } catch (error) {
            console.error('Analytics: Error tracking purchase:', error);
        }
    }

    trackSearch(searchTerm, resultType = null, resultId = null) {
        console.log('📊 Tracking search:', searchTerm);
        try {
            // Track with GA4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'search', {
                    search_term: searchTerm,
                });
            }

            // Track with backend
            this.sendAnalyticsEvent('search', {
                search_term: searchTerm,
                result_type: resultType,
                result_id: resultId,
            });
        } catch (error) {
            console.error('Analytics: Error tracking search:', error);
        }
    }

    async sendAnalyticsEvent(eventType, eventData) {
        try {
            const payload = {
                eventType,
                sessionId: this.sessionId, // Move sessionId to top level as expected by backend
                eventData: {
                    ...eventData,
                    user_id: this.userId,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                },
            };

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

export default analytics;
