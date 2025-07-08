// ===========================================
// VALIDATION EXPORTS
// ===========================================
// Central export file for all validation schemas

// User validations
export * from './userValidation.js';

// Product validations
export * from './productValidation.js';

// Category validations
export * from './categoryValidation.js';

// Message validations
export * from './messageValidation.js';

// Order validations
export * from './orderValidation.js';

// Cart validations
export * from './cartValidation.js';

// Coupon validations
export * from './couponValidation.js';

// Common validation helpers
export const validateId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
    return phoneRegex.test(phone);
};

export const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validatePrice = (price) => {
    return typeof price === 'number' && price >= 0 && price <= 999999999;
};

export const validateQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity >= 0 && quantity <= 10000;
};

export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.getTime() < end.getTime();
};

export const validatePagination = (page, limit) => {
    const validPage = Number.isInteger(page) && page >= 1;
    const validLimit = Number.isInteger(limit) && limit >= 1 && limit <= 100;
    return validPage && validLimit;
};

export const validateSortOrder = (order) => {
    return ['asc', 'desc', 'ascending', 'descending', 1, -1].includes(order);
};
