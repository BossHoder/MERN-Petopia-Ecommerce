/**
 * Analytics Utility Functions
 * Centralized calculations and data processing for analytics
 */

/**
 * Calculate percentage safely
 */
export const calculatePercentage = (value, total, decimals = 1) => {
    if (!total || total === 0) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (!amount || isNaN(amount)) return showSymbol ? '0đ' : '0';
    const formatted = Math.round(amount).toLocaleString('vi-VN');
    return showSymbol ? `${formatted}đ` : formatted;
};

/**
 * Calculate trend indicator based on current vs previous values
 */
export const calculateTrend = (current, previous, decimals = 1) => {
    if (!previous || previous === 0) {
        return {
            type: current > 0 ? 'positive' : 'neutral',
            value: current > 0 ? 100 : 0,
            label: current > 0 ? 'New data' : 'No data',
        };
    }

    const change = ((current - previous) / previous) * 100;
    const roundedChange = Number(change.toFixed(decimals));

    return {
        type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
        value: Math.abs(roundedChange),
        label: `${change > 0 ? '+' : ''}${roundedChange}%`,
    };
};

/**
 * Calculate days in period based on range string
 */
export const getDaysInPeriod = (range) => {
    switch (range) {
        case '7days':
            return 7;
        case '30days':
            return 30;
        case '90days':
            return 90;
        default:
            return 30;
    }
};

/**
 * Calculate average per day/week/month with proper weekly calculation
 */
export const calculateAverage = (total, period, unit = 'day') => {
    if (!total || !period) return 0;

    switch (unit) {
        case 'day':
            return total / period;
        case 'week':
            // Calculate actual weekly average: total revenue per week for the period
            const weeks = Math.ceil(period / 7);
            return total / weeks;
        case 'month':
            return total / Math.ceil(period / 30);
        default:
            return total / period;
    }
};

/**
 * Calculate real weekly sales from daily data
 */
export const calculateWeeklySales = (totalRevenue, periodDays) => {
    if (!totalRevenue || !periodDays) return 0;

    // If period is less than 7 days, extrapolate to weekly
    if (periodDays < 7) {
        return (totalRevenue / periodDays) * 7;
    }

    // If period is exactly or more than 7 days, calculate weekly average
    const weeks = periodDays / 7;
    return totalRevenue / weeks;
};

/**
 * Safe array access with fallback
 */
export const safeArrayAccess = (array, index = 0, fallback = null) => {
    return Array.isArray(array) && array.length > index ? array[index] : fallback;
};

/**
 * Get order status breakdown safely
 */
export const getOrderStatusCount = (orderStatusBreakdown, status) => {
    if (!Array.isArray(orderStatusBreakdown)) return 0;
    const statusData = orderStatusBreakdown.find((s) => s._id === status);
    return statusData ? statusData.count : 0;
};

/**
 * Calculate fulfillment rate (completed/delivered orders vs total)
 */
export const calculateFulfillmentRate = (orderStatusBreakdown, totalOrders) => {
    if (!Array.isArray(orderStatusBreakdown) || !totalOrders || totalOrders === 0) return 0;

    const completedCount = getOrderStatusCount(orderStatusBreakdown, 'completed');
    const deliveredCount = getOrderStatusCount(orderStatusBreakdown, 'delivered');

    return calculatePercentage(completedCount + deliveredCount, totalOrders, 0);
};

/**
 * Calculate customer health score based on metrics
 */
export const calculateCustomerHealthScore = (
    retentionRate = 0,
    repeatPurchaseRate = 0,
    orderFrequency = 0,
) => {
    // Normalized weights that add up to 1
    const weights = {
        retention: 0.4, // 40% - most important
        repeatPurchase: 0.35, // 35% - very important
        frequency: 0.2, // 25% - moderately important
    };

    // Normalize values to 0-100 scale
    const normalizedRetention = Math.min(retentionRate, 100);
    const normalizedRepeatPurchase = Math.min(repeatPurchaseRate * 100, 100);
    const normalizedFrequency = Math.min(orderFrequency * 20, 100); // Cap at 5 orders/month = 100

    const healthScore =
        normalizedRetention * weights.retention +
        normalizedRepeatPurchase * weights.repeatPurchase +
        normalizedFrequency * weights.frequency;

    return Math.min(Math.round(healthScore), 100);
};

/**
 * Calculate conversion funnel efficiency
 */
export const calculateFunnelEfficiency = (conversionData) => {
    if (!conversionData || typeof conversionData !== 'object') return 0;

    const steps = Object.values(conversionData);
    if (steps.length === 0) return 0;

    const avgConversion =
        steps.reduce((sum, step) => {
            return sum + (step.conversionRate || 0);
        }, 0) / steps.length;

    return Number(avgConversion.toFixed(1));
};

/**
 * Get top performing item from array
 */
export const getTopPerformer = (items, sortKey = 'count', labelKey = '_id') => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const sorted = [...items].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    return sorted[0] ? sorted[0][labelKey] : null;
};

/**
 * Calculate improvement potential for conversion
 */
export const calculateImprovementPotential = (conversionData) => {
    if (!conversionData) return 25; // Default improvement potential

    const orderRate = conversionData.order_completed?.conversionRate || 0;
    const viewCount = conversionData.product_viewed?.count || 0;

    if (viewCount === 0) return 25;

    // Higher view count but low conversion = high improvement potential
    const potential = Math.min(100 - orderRate, 50);
    return Math.max(potential, 10); // Minimum 10% improvement potential
};

/**
 * Generate dynamic sales goals based on historical data
 */
export const calculateDynamicGoals = (historicalRevenue, period = 30) => {
    if (!historicalRevenue || historicalRevenue === 0) {
        // Default goals for new businesses
        return {
            daily: 1000000, // 1M VND/day
            weekly: 7000000, // 7M VND/week
            monthly: 30000000, // 30M VND/month
        };
    }

    // Calculate growth-based goals (10% increase from current average)
    const dailyAverage = historicalRevenue / period;
    const growthMultiplier = 1.1; // 10% growth target

    return {
        daily: Math.round(dailyAverage * growthMultiplier),
        weekly: Math.round(dailyAverage * 7 * growthMultiplier),
        monthly: Math.round(dailyAverage * 30 * growthMultiplier),
    };
};

/**
 * Format large numbers with units (K, M)
 */
export const formatLargeNumber = (num, decimals = 1) => {
    if (!num || isNaN(num)) return '0';

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(decimals)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(decimals)}K`;
    }

    return num.toString();
};

/**
 * Get date range label for display
 */
export const getDateRangeLabel = (range) => {
    switch (range) {
        case '7days':
            return 'Last 7 days';
        case '30days':
            return 'Last 30 days';
        case '90days':
            return 'Last 90 days';
        default:
            return 'Current period';
    }
};
