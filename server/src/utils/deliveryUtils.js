/**
 * Delivery Time Calculation Utilities
 * Handles business day calculations and delivery estimates
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - Date to check
 * @returns {boolean} - True if weekend
 */
export const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if a date is a Vietnamese public holiday
 * @param {Date} date - Date to check
 * @returns {boolean} - True if holiday
 */
export const isVietnameseHoliday = (date) => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    
    // Vietnamese public holidays (fixed dates)
    const holidays = [
        { month: 1, day: 1 },   // New Year's Day
        { month: 4, day: 30 },  // Liberation Day
        { month: 5, day: 1 },   // Labor Day
        { month: 9, day: 2 },   // National Day
        // Note: Tet (Lunar New Year) and other lunar holidays would need more complex calculation
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
};

/**
 * Check if a date is a business day
 * @param {Date} date - Date to check
 * @returns {boolean} - True if business day
 */
export const isBusinessDay = (date) => {
    return !isWeekend(date) && !isVietnameseHoliday(date);
};

/**
 * Add business days to a date
 * @param {Date} startDate - Starting date
 * @param {number} businessDays - Number of business days to add
 * @returns {Date} - Resulting date
 */
export const addBusinessDays = (startDate, businessDays) => {
    const result = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
        result.setDate(result.getDate() + 1);
        if (isBusinessDay(result)) {
            daysAdded++;
        }
    }
    
    return result;
};

/**
 * Calculate estimated delivery date range
 * @param {Date} orderDate - Order creation date
 * @param {number} minDays - Minimum delivery days (default: 2)
 * @param {number} maxDays - Maximum delivery days (default: 4)
 * @returns {Object} - Delivery range with start and end dates
 */
export const calculateDeliveryRange = (orderDate, minDays = 2, maxDays = 4) => {
    const startDate = addBusinessDays(orderDate, minDays);
    const endDate = addBusinessDays(orderDate, maxDays);
    
    return {
        start: startDate,
        end: endDate,
        businessDays: { min: minDays, max: maxDays }
    };
};

/**
 * Calculate estimated delivery date (middle of range)
 * @param {Date} orderDate - Order creation date
 * @param {number} minDays - Minimum delivery days (default: 2)
 * @param {number} maxDays - Maximum delivery days (default: 4)
 * @returns {Date} - Estimated delivery date
 */
export const calculateEstimatedDeliveryDate = (orderDate, minDays = 2, maxDays = 4) => {
    const avgDays = Math.ceil((minDays + maxDays) / 2);
    return addBusinessDays(orderDate, avgDays);
};

/**
 * Format delivery range for display
 * @param {Object} deliveryRange - Range object with start and end dates
 * @param {string} locale - Locale for formatting (default: 'vi-VN')
 * @returns {string} - Formatted delivery range string
 */
export const formatDeliveryRange = (deliveryRange, locale = 'vi-VN') => {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const startFormatted = deliveryRange.start.toLocaleDateString(locale, options);
    const endFormatted = deliveryRange.end.toLocaleDateString(locale, options);
    
    return `${startFormatted} - ${endFormatted}`;
};

/**
 * Get delivery estimate text for display
 * @param {Date} orderDate - Order creation date
 * @param {string} locale - Locale for text (default: 'en')
 * @returns {string} - Delivery estimate text
 */
export const getDeliveryEstimateText = (orderDate, locale = 'en') => {
    const range = calculateDeliveryRange(orderDate);
    
    const texts = {
        en: `Estimated delivery: 2-4 business days from order date`,
        vi: `Dự kiến giao hàng: 2-4 ngày làm việc kể từ ngày đặt hàng`
    };
    
    return texts[locale] || texts.en;
};

/**
 * Calculate automatic transition times
 * @param {Date} orderDate - Order creation date
 * @returns {Object} - Scheduled transition times
 */
export const calculateAutomaticTransitionTimes = (orderDate) => {
    const pendingToProcessing = new Date(orderDate.getTime() + (1 * 60 * 1000)); // 1 minute
    const processingToDelivering = new Date(orderDate.getTime() + (31 * 60 * 1000)); // 31 minutes (1 min + 30 min)
    
    return {
        pendingToProcessing,
        processingToDelivering
    };
};

/**
 * Check if an order is ready for automatic transition
 * @param {Object} order - Order object
 * @param {string} transition - Transition type ('pendingToProcessing' or 'processingToDelivering')
 * @returns {boolean} - True if ready for transition
 */
export const isReadyForAutomaticTransition = (order, transition) => {
    const now = new Date();
    const transitions = order.automaticTransitions;
    
    if (!transitions || !transitions[transition]) {
        return false;
    }
    
    const scheduledTime = transitions[transition].scheduledAt;
    const executedTime = transitions[transition].executedAt;
    
    // Check if already executed
    if (executedTime) {
        return false;
    }
    
    // Check if scheduled time has passed
    if (scheduledTime && now >= scheduledTime) {
        return true;
    }
    
    return false;
};

/**
 * Validate payment requirements for automatic transitions
 * @param {Object} order - Order object
 * @param {string} newStatus - Target status
 * @returns {Object} - Validation result
 */
export const validateAutomaticTransition = (order, newStatus) => {
    // For delivering status, check payment requirements (except COD)
    if (newStatus === 'delivering') {
        if (order.paymentMethod !== 'COD' && !order.isPaid) {
            return {
                isValid: false,
                reason: 'Payment required for non-COD orders before delivery'
            };
        }
    }
    
    // Check if order is in correct current status
    const validTransitions = {
        'processing': ['pending'],
        'delivering': ['processing']
    };
    
    if (validTransitions[newStatus] && !validTransitions[newStatus].includes(order.orderStatus)) {
        return {
            isValid: false,
            reason: `Invalid transition from ${order.orderStatus} to ${newStatus}`
        };
    }
    
    return {
        isValid: true,
        reason: null
    };
};
