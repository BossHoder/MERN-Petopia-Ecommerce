/**
 * Checkout utility functions for price calculations and coupon handling
 */

/**
 * Calculate item subtotal from cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Subtotal amount
 */
export const calculateItemsPrice = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return 0;

    return cartItems.reduce((total, item) => {
        const price = item.salePrice || item.price || 0;
        const quantity = item.quantity || 0;
        return total + price * quantity;
    }, 0);
};

/**
 * Calculate shipping cost based on subtotal
 * @param {number} subtotal - Order subtotal
 * @param {number} freeShippingThreshold - Minimum amount for free shipping (default: 200000 VND)
 * @param {number} standardShippingCost - Standard shipping cost (default: 30000 VND)
 * @returns {number} Shipping cost
 */
export const calculateShippingPrice = (
    subtotal,
    freeShippingThreshold = 200000,
    standardShippingCost = 30000,
) => {
    return subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
};

/**
 * Calculate tax amount (currently 0% for Vietnam)
 * @param {number} subtotal - Order subtotal
 * @param {number} taxRate - Tax rate (default: 0)
 * @returns {number} Tax amount
 */
export const calculateTaxPrice = (subtotal, taxRate = 0) => {
    return subtotal * taxRate;
};

/**
 * Calculate coupon discount amount
 * @param {Object} coupon - Applied coupon object
 * @param {number} subtotal - Order subtotal before discount
 * @returns {number} Discount amount
 */
export const calculateCouponDiscount = (coupon, subtotal) => {
    if (!coupon || !coupon.applied) return 0;

    // If we have a server-calculated discount amount, use it (it already respects limits)
    if (coupon.discountAmount !== undefined && coupon.discountAmount !== null) {
        return Math.round(coupon.discountAmount);
    }

    // Fallback to client-side calculation if server amount is not available
    const { discountType, discountValue, maxDiscountAmount } = coupon.applied;
    let discountAmount = 0;

    if (discountType === 'percentage') {
        discountAmount = (subtotal * discountValue) / 100;

        // Apply maximum discount limit if specified
        if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
            discountAmount = maxDiscountAmount;
        }
    } else if (discountType === 'fixed') {
        discountAmount = discountValue;

        // Discount cannot exceed subtotal
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }
    }

    return Math.round(discountAmount);
};

/**
 * Calculate complete order pricing with all components
 * @param {Array} cartItems - Array of cart items
 * @param {Object} coupon - Applied coupon state from Redux
 * @param {Object} options - Additional options
 * @returns {Object} Complete pricing breakdown
 */
export const calculateOrderPricing = (cartItems, coupon = null, options = {}) => {
    const { freeShippingThreshold = 200000, standardShippingCost = 30000, taxRate = 0 } = options;

    // Calculate base amounts
    const itemsPrice = calculateItemsPrice(cartItems);
    const shippingPrice = calculateShippingPrice(
        itemsPrice,
        freeShippingThreshold,
        standardShippingCost,
    );
    const taxPrice = calculateTaxPrice(itemsPrice, taxRate);

    // Calculate coupon discount
    const couponDiscount = calculateCouponDiscount(coupon, itemsPrice);

    // Calculate final total
    const totalPrice = itemsPrice + shippingPrice + taxPrice - couponDiscount;

    return {
        itemsPrice: Math.round(itemsPrice),
        shippingPrice: Math.round(shippingPrice),
        taxPrice: Math.round(taxPrice),
        couponDiscount: Math.round(couponDiscount),
        totalPrice: Math.round(Math.max(0, totalPrice)), // Ensure total is never negative

        // Additional info
        hasFreeShipping: shippingPrice === 0,
        freeShippingThreshold,
        amountToFreeShipping: Math.max(0, freeShippingThreshold - itemsPrice),
    };
};

/**
 * Format price for display
 * @param {number} price - Price amount
 * @param {string} currency - Currency symbol (default: '₫')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '₫') => {
    if (typeof price !== 'number' || isNaN(price)) return `0${currency}`;
    return `${price.toLocaleString('vi-VN')}${currency}`;
};

/**
 * Validate coupon requirements
 * @param {Object} coupon - Coupon object
 * @param {number} orderValue - Current order value
 * @param {string} userId - User ID (optional for guest users)
 * @returns {Object} Validation result
 */
export const validateCouponRequirements = (coupon, orderValue, userId = null) => {
    if (!coupon) {
        return { isValid: false, message: 'No coupon provided' };
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
        return {
            isValid: false,
            message: `Minimum order value of ${formatPrice(coupon.minOrderValue)} required`,
            requiredAmount: coupon.minOrderValue,
            currentAmount: orderValue,
            shortfall: coupon.minOrderValue - orderValue,
        };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
        return { isValid: false, message: 'Coupon is not active' };
    }

    // Check expiry dates
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now < validFrom) {
        return { isValid: false, message: 'Coupon is not yet valid' };
    }

    if (now > validUntil) {
        return { isValid: false, message: 'Coupon has expired' };
    }

    return { isValid: true, message: 'Coupon is valid' };
};

/**
 * Get order summary for display
 * @param {Array} cartItems - Cart items
 * @param {Object} coupon - Applied coupon
 * @param {Object} options - Calculation options
 * @returns {Object} Order summary object
 */
export const getOrderSummary = (cartItems, coupon = null, options = {}) => {
    const pricing = calculateOrderPricing(cartItems, coupon, options);

    return {
        ...pricing,
        itemCount: cartItems
            ? cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
            : 0,
        uniqueItemCount: cartItems ? cartItems.length : 0,
        appliedCoupon: coupon?.applied || null,
        savings: pricing.couponDiscount,
        formattedPrices: {
            itemsPrice: formatPrice(pricing.itemsPrice),
            shippingPrice: formatPrice(pricing.shippingPrice),
            taxPrice: formatPrice(pricing.taxPrice),
            couponDiscount: formatPrice(pricing.couponDiscount),
            totalPrice: formatPrice(pricing.totalPrice),
            savings: formatPrice(pricing.couponDiscount),
        },
    };
};

/**
 * Check if order qualifies for free shipping
 * @param {number} orderValue - Current order value
 * @param {number} threshold - Free shipping threshold
 * @returns {Object} Free shipping status
 */
export const getFreeShippingStatus = (orderValue, threshold = 200000) => {
    const qualifies = orderValue >= threshold;
    const amountNeeded = Math.max(0, threshold - orderValue);

    return {
        qualifies,
        threshold,
        currentAmount: orderValue,
        amountNeeded,
        formattedAmountNeeded: formatPrice(amountNeeded),
        formattedThreshold: formatPrice(threshold),
    };
};
