/**
 * Analytics Configuration
 * Centralized configuration for analytics dashboard
 */

/**
 * Category icons mapping
 */
export const CATEGORY_ICONS = {
    Dog: '🐕',
    Cat: '🐱',
    Bird: '🐦',
    Fish: '🐠',
    Rabbit: '🐰',
    Hamster: '🐹',
    'Pet Food': '🥘',
    'Pet Accessories': '🎾',
    'Pet Care': '🧴',
    'Health & Medicine': '💊',
    Toys: '🧸',
    Clothing: '👕',
    Bedding: '🛏️',
    default: '📦',
};

/**
 * Acquisition channel icons and labels
 */
export const ACQUISITION_CHANNELS = {
    organic_search: { icon: '🔍', label: 'Organic Search' },
    social_media: { icon: '📱', label: 'Social Media' },
    email_marketing: { icon: '📧', label: 'Email Marketing' },
    paid_ads: { icon: '💰', label: 'Paid Ads' },
    direct: { icon: '🔗', label: 'Direct Traffic' },
    referral: { icon: '👥', label: 'Referral' },
    affiliate: { icon: '🤝', label: 'Affiliate' },
    default: { icon: '📊', label: 'Other' },
};

/**
 * Payment method icons and labels
 */
export const PAYMENT_METHODS = {
    credit_card: { icon: '💳', label: 'Credit Card' },
    bank_transfer: { icon: '🏦', label: 'Bank Transfer' },
    cod: { icon: '💵', label: 'Cash on Delivery' },
    e_wallet: { icon: '📱', label: 'E-Wallet' },
    paypal: { icon: '🅿️', label: 'PayPal' },
    default: { icon: '💰', label: 'Unknown Payment' },
};

/**
 * Order status configuration
 */
export const ORDER_STATUSES = {
    pending: { icon: '⏳', label: 'Pending', className: 'processing', color: '#ffa500' },
    processing: { icon: '📦', label: 'Processing', className: 'processing', color: '#3498db' },
    shipped: { icon: '🚚', label: 'Shipped', className: 'shipped', color: '#9b59b6' },
    completed: { icon: '✅', label: 'Completed', className: 'delivered', color: '#27ae60' },
    delivered: { icon: '✅', label: 'Delivered', className: 'delivered', color: '#27ae60' },
    cancelled: { icon: '❌', label: 'Cancelled', className: 'cancelled', color: '#e74c3c' },
    returned: { icon: '↩️', label: 'Returned', className: 'cancelled', color: '#e67e22' },
    refunded: { icon: '💸', label: 'Refunded', className: 'cancelled', color: '#e74c3c' },
    undefined: { icon: '❓', label: 'Processing', className: 'processing', color: '#95a5a6' }, // Handle undefined status
    default: { icon: '📋', label: 'Processing', className: 'processing', color: '#95a5a6' },
};

/**
 * Stock level configuration
 */
export const STOCK_LEVELS = {
    critical: { threshold: 2, className: 'critical', color: '#e74c3c', label: 'Critical' },
    warning: { threshold: 10, className: 'warning', color: '#f39c12', label: 'Low Stock' },
    normal: { threshold: Infinity, className: 'normal', color: '#27ae60', label: 'In Stock' },
};

/**
 * Performance indicator thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    conversion: {
        high: 3.0, // > 3% is high performance
        medium: 1.5, // 1.5-3% is medium performance
        low: 0, // < 1.5% is low performance
    },
    revenue: {
        high: 50000000, // > 50M VND is high
        medium: 10000000, // 10-50M VND is medium
        low: 0, // < 10M VND is low
    },
    orders: {
        high: 100, // > 100 orders is high
        medium: 20, // 20-100 orders is medium
        low: 0, // < 20 orders is low
    },
    customers: {
        high: 1000, // > 1000 customers is high
        medium: 100, // 100-1000 customers is medium
        low: 0, // < 100 customers is low
    },
};

/**
 * Customer segment configuration
 */
export const CUSTOMER_SEGMENTS = {
    vip: {
        icon: '💎',
        label: 'VIP Customers',
        className: 'vip',
        color: '#9b59b6',
        criteria: 'LTV > 5,000,000đ, 10+ orders',
    },
    loyal: {
        icon: '🔄',
        label: 'Loyal Customers',
        className: 'loyal',
        color: '#3498db',
        criteria: '3-9 repeat orders, High engagement',
    },
    regular: {
        icon: '👤',
        label: 'Regular Customers',
        className: 'regular',
        color: '#27ae60',
        criteria: '1-2 repeat orders, Medium engagement',
    },
    new: {
        icon: '✨',
        label: 'New Customers',
        className: 'new',
        color: '#f39c12',
        criteria: 'First-time buyers, Recent signups',
    },
};

/**
 * Conversion funnel steps
 */
export const CONVERSION_STEPS = {
    product_viewed: { icon: '👁️', label: 'Product Viewed', order: 1 },
    product_added_to_cart: { icon: '🛒', label: 'Added to Cart', order: 2 },
    checkout_started: { icon: '💳', label: 'Checkout Started', order: 3 },
    order_completed: { icon: '✅', label: 'Order Completed', order: 4 },
};

/**
 * Chart colors palette
 */
export const CHART_COLORS = {
    primary: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#17a2b8',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#343a40',
};

/**
 * Device/Browser icons
 */
export const DEVICE_ICONS = {
    mobile: '📱',
    desktop: '🖥️',
    tablet: '📱',
    chrome: '🌐',
    firefox: '🦊',
    safari: '🧭',
    edge: '🌊',
    ios: '🍎',
    android: '🤖',
    default: '📊',
};

/**
 * Business goals and KPI targets - DYNAMIC CALCULATIONS
 */
export const getBusinessTargets = (historicalData = null) => {
    // Base targets for new businesses
    const baseTargets = {
        dailyRevenue: 1600000, // 1.6M VND per day
        monthlyRevenue: 48000000, // 48M VND per month
        conversionRate: 2.5, // 2.5% target conversion
        customerRetention: 65, // 65% retention rate
        averageOrderValue: 800000, // 800K VND average order
        customerLifetimeValue: 3000000, // 3M VND LTV
        inventoryTurnover: 12, // 12 times per year
        customerSatisfaction: 4.5, // 4.5/5 stars
    };

    // If no historical data, return base targets
    if (!historicalData) return baseTargets;

    // Calculate growth-based targets (10% increase from historical performance)
    const growthMultiplier = 1.1;

    return {
        dailyRevenue: Math.max(
            (historicalData.dailyAverage || baseTargets.dailyRevenue) * growthMultiplier,
            baseTargets.dailyRevenue,
        ),
        monthlyRevenue: Math.max(
            (historicalData.monthlyAverage || baseTargets.monthlyRevenue) * growthMultiplier,
            baseTargets.monthlyRevenue,
        ),
        conversionRate: Math.max(
            (historicalData.conversionRate || baseTargets.conversionRate) * growthMultiplier,
            baseTargets.conversionRate,
        ),
        averageOrderValue: Math.max(
            (historicalData.averageOrderValue || baseTargets.averageOrderValue) * growthMultiplier,
            baseTargets.averageOrderValue,
        ),
        customerRetention: baseTargets.customerRetention,
        customerLifetimeValue: baseTargets.customerLifetimeValue,
        inventoryTurnover: baseTargets.inventoryTurnover,
        customerSatisfaction: baseTargets.customerSatisfaction,
    };
};

// Default static targets for backward compatibility
export const BUSINESS_TARGETS = {
    dailyRevenue: 1600000, // 1.6M VND per day
    monthlyRevenue: 48000000, // 48M VND per month
    conversionRate: 2.5, // 2.5% target conversion
    customerRetention: 65, // 65% retention rate
    averageOrderValue: 800000, // 800K VND average order
    customerLifetimeValue: 3000000, // 3M VND LTV
    inventoryTurnover: 12, // 12 times per year
    customerSatisfaction: 4.5, // 4.5/5 stars
};

/**
 * Analytics update intervals (in milliseconds)
 */
export const UPDATE_INTERVALS = {
    realTime: 30000, // 30 seconds
    dashboard: 300000, // 5 minutes
    reports: 3600000, // 1 hour
};

/**
 * Export configurations by category
 */
export const CONFIG = {
    categories: CATEGORY_ICONS,
    channels: ACQUISITION_CHANNELS,
    payments: PAYMENT_METHODS,
    statuses: ORDER_STATUSES,
    stock: STOCK_LEVELS,
    performance: PERFORMANCE_THRESHOLDS,
    segments: CUSTOMER_SEGMENTS,
    conversion: CONVERSION_STEPS,
    colors: CHART_COLORS,
    devices: DEVICE_ICONS,
    targets: BUSINESS_TARGETS,
    getTargets: getBusinessTargets, // Dynamic target calculator
    intervals: UPDATE_INTERVALS,
};

export default CONFIG;
