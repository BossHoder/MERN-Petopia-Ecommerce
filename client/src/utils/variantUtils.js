/**
 * Utility functions for variant handling in product detail pages
 */

/**
 * Get variant display name
 * @param {Object} variant - Variant object
 * @returns {string} - Display name for the variant
 */
export const getVariantDisplayName = (variant) => {
    if (!variant) return '';
    
    if (variant.name) {
        return variant.name;
    }
    
    // Fallback: create name from attributes
    if (variant.attributes) {
        const attributeValues = Object.values(variant.attributes).filter(Boolean);
        if (attributeValues.length > 0) {
            return attributeValues.join(' - ');
        }
    }
    
    return 'Variant';
};

/**
 * Check if variant is available (has stock)
 * @param {Object} variant - Variant object
 * @returns {boolean} - Whether variant is available
 */
export const isVariantAvailable = (variant) => {
    if (!variant) return false;
    
    const stock = variant.stockQuantity || variant.stock || 0;
    return stock > 0;
};

/**
 * Get variant image URL
 * @param {Object} variant - Variant object
 * @returns {string|null} - Image URL or null
 */
export const getVariantImage = (variant) => {
    if (!variant || !variant.images || variant.images.length === 0) {
        return null;
    }
    
    const image = variant.images[0];
    if (typeof image === 'string') {
        return image.startsWith('http') 
            ? image 
            : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image}`;
    }
    
    return image?.url || image?.preview || null;
};

/**
 * Merge product attributes with variant attributes
 * @param {Object} productAttributes - Base product attributes
 * @param {Object} variantAttributes - Variant-specific attributes
 * @returns {Object} - Merged attributes
 */
export const mergeAttributes = (productAttributes = {}, variantAttributes = {}) => {
    return {
        ...productAttributes,
        ...variantAttributes
    };
};

/**
 * Check if an image belongs to a specific variant
 * @param {string} imageUrl - Image URL to check
 * @param {Object} variant - Variant object
 * @param {Array} productImages - Main product images
 * @returns {boolean} - Whether image is variant-specific
 */
export const isImageVariantSpecific = (imageUrl, variant, productImages = []) => {
    if (!variant || !variant.images) return false;
    
    const normalizeUrl = (url) => {
        if (typeof url === 'string') {
            return url.startsWith('http') 
                ? url 
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${url}`;
        }
        return url?.url || url?.preview || '';
    };
    
    const normalizedImageUrl = normalizeUrl(imageUrl);
    const isInVariantImages = variant.images.some(img => normalizeUrl(img) === normalizedImageUrl);
    const isInProductImages = productImages.some(img => normalizeUrl(img) === normalizedImageUrl);
    
    return isInVariantImages && !isInProductImages;
};

/**
 * Get current price based on variant selection
 * @param {Object} product - Product object
 * @param {Object} selectedVariant - Selected variant object
 * @returns {number} - Current price
 */
export const getCurrentPrice = (product, selectedVariant) => {
    if (selectedVariant && selectedVariant.price !== undefined) {
        return selectedVariant.price;
    }
    return product?.price || 0;
};

/**
 * Get current stock based on variant selection
 * @param {Object} product - Product object
 * @param {Object} selectedVariant - Selected variant object
 * @returns {number} - Current stock
 */
export const getCurrentStock = (product, selectedVariant) => {
    if (selectedVariant) {
        return selectedVariant.stockQuantity || selectedVariant.stock || 0;
    }
    return product?.stockQuantity || 0;
};

/**
 * Validate variant selection
 * @param {Object} variant - Variant to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateVariant = (variant) => {
    const errors = [];
    
    if (!variant) {
        return { isValid: false, errors: ['Variant is required'] };
    }
    
    if (!variant.name) {
        errors.push('Variant name is required');
    }
    
    if (variant.price === undefined || variant.price < 0) {
        errors.push('Valid price is required');
    }
    
    const stock = variant.stockQuantity || variant.stock || 0;
    if (stock < 0) {
        errors.push('Stock cannot be negative');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
