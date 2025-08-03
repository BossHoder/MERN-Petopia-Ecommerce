/**
 * Simple Analytics Utility for Testing
 */

class SimpleAnalytics {
    trackProductView(product) {
        console.log('✅ Simple trackProductView called with:', product);
    }

    trackAddToCart(product) {
        console.log('✅ Simple trackAddToCart called with:', product);
    }

    trackRemoveFromCart(product) {
        console.log('✅ Simple trackRemoveFromCart called with:', product);
    }
}

// Export singleton instance
const analytics = new SimpleAnalytics();

console.log('Simple Analytics instance created:', analytics);
console.log('Simple trackProductView method:', typeof analytics.trackProductView);

export default analytics;
