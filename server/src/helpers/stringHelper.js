/**
 * String utility helpers
 */

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        // Replace Vietnamese characters
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace special characters
        .replace(/[^a-z0-9\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Replace multiple hyphens with single
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
};

/**
 * Generate unique SKU
 * @param {string} productName - Product name
 * @param {string} category - Category slug
 * @returns {string} - Generated SKU
 */
export const generateSKU = (productName, category) => {
    const namePrefix = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);

    const categoryPrefix = category
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 4);

    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${categoryPrefix}-${namePrefix}-${randomSuffix}`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Format price for display
 * @param {number} price - Price number
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, currency = '$') => {
    if (typeof price !== 'number') return `${currency}0.00`;
    return `${currency}${price.toFixed(2)}`;
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} - Discount percentage
 */
export const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
