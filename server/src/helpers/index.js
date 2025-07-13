// ===========================================
// HELPER EXPORTS
// ===========================================
// Central export file for all helper functions

// Database helpers
export * from './databaseHelper.js';

// String helpers
export * from './stringHelper.js';

// Password helpers
export * from './passwordHelper.js';

// Response helpers
export * from './responseHelper.js';

// Product helpers
export * from './productHelper.js';

// User helpers
export * from './userHelper.js';

// Order helpers
export * from './orderHelper.js';

// Cart helpers
export * from './cartHelper.js';

// Coupon helpers
export * from './couponHelper.js';

// Notification helpers
export * from './notificationHelper.js';

// Common utility functions
export const createId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await sleep(delay * (i + 1));
            }
        }
    }

    throw lastError;
};

export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const unique = (array, key) => {
    if (key) {
        const seen = new Set();
        return array.filter((item) => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
};

export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
};

export const pick = (obj, keys) => {
    const result = {};
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};

export const isEmpty = (value) => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

export const merge = (...objects) => {
    return objects.reduce((result, obj) => {
        return { ...result, ...obj };
    }, {});
};

export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
