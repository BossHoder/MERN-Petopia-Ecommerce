/**
 * Utility functions for displaying complex data types in React components
 */

/**
 * Safely render any value as a string for React display
 * @param {any} value - The value to render
 * @param {string} key - Optional key for context-specific formatting
 * @returns {string} - Safe string representation
 */
export const renderValue = (value, key = '') => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return '';
    }

    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    // Handle objects
    if (typeof value === 'object') {
        // Special handling for dimensions
        if (key === 'dimensions' && value.length !== undefined && value.width !== undefined) {
            const dims = [];
            if (value.length) dims.push(`L: ${value.length}cm`);
            if (value.width) dims.push(`W: ${value.width}cm`);
            if (value.height) dims.push(`H: ${value.height}cm`);
            return dims.join(' × ');
        }

        // Special handling for arrays
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // For other objects, create a readable string
        try {
            const entries = Object.entries(value);
            if (entries.length === 0) return '';

            return entries.map(([k, v]) => `${k}: ${renderValue(v)}`).join(', ');
        } catch (error) {
            return JSON.stringify(value);
        }
    }

    // Fallback
    return String(value);
};

/**
 * Format product attributes for display
 * @param {Object} attributes - Product attributes object
 * @returns {Array} - Array of formatted attribute objects
 */
export const formatProductAttributes = (attributes) => {
    if (!attributes || typeof attributes !== 'object') {
        return [];
    }

    return Object.entries(attributes).map(([key, value]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: renderValue(value, key),
        rawValue: value,
    }));
};

/**
 * Format dimensions object for display
 * @param {Object} dimensions - Dimensions object with length, width, height
 * @returns {string} - Formatted dimensions string
 */
export const formatDimensions = (dimensions) => {
    if (!dimensions || typeof dimensions !== 'object') {
        return '';
    }

    const dims = [];
    if (dimensions.length) dims.push(`${dimensions.length}cm`);
    if (dimensions.width) dims.push(`${dimensions.width}cm`);
    if (dimensions.height) dims.push(`${dimensions.height}cm`);

    return dims.length > 0 ? dims.join(' × ') : '';
};

/**
 * Safely get nested object property
 * @param {Object} obj - Object to search
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} - Found value or default
 */
export const getNestedValue = (obj, path, defaultValue = '') => {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }

    return current;
};

/**
 * Format price with Vietnamese Dong currency
 * @param {number} price - Price value
 * @returns {string} - Formatted price string with Vietnamese Dong
 */
export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0₫';
    }
    return `${price.toLocaleString('vi-VN')}₫`;
};

/**
 * Format price with currency (legacy support)
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol (default: '₫')
 * @returns {string} - Formatted price string
 */
export const formatPriceWithCurrency = (price, currency = '₫') => {
    if (typeof price !== 'number' || isNaN(price)) {
        return `0${currency}`;
    }
    return `${price.toLocaleString('vi-VN')}${currency}`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength - suffix.length) + suffix;
};
