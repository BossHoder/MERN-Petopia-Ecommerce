// ===========================================
// VARIANT UTILITY FUNCTIONS
// ===========================================

/**
 * Generate a unique SKU for a variant combination
 * @param {string} baseSku - Base product SKU
 * @param {Object} attributeSelections - Selected attributes {color: 'red', size: 'l'}
 * @returns {string} Generated SKU
 */
export const generateVariantSku = (baseSku, attributeSelections) => {
    const sortedKeys = Object.keys(attributeSelections).sort();
    const suffix = sortedKeys
        .map(key => `${key.charAt(0).toUpperCase()}${attributeSelections[key].charAt(0).toUpperCase()}`)
        .join('');
    return `${baseSku}-${suffix}`;
};

/**
 * Generate combination key from attribute selections
 * @param {Object} attributeSelections - Selected attributes {color: 'red', size: 'l'}
 * @returns {string} Combination key
 */
export const generateCombinationKey = (attributeSelections) => {
    const sortedKeys = Object.keys(attributeSelections).sort();
    return sortedKeys.map(key => `${key}:${attributeSelections[key].toLowerCase()}`).join(',');
};

/**
 * Parse combination key back to attribute selections
 * @param {string} combinationKey - Combination key like "color:red,size:l"
 * @returns {Object} Attribute selections
 */
export const parseCombinationKey = (combinationKey) => {
    const selections = {};
    combinationKey.split(',').forEach(pair => {
        const [key, value] = pair.split(':');
        selections[key] = value;
    });
    return selections;
};

/**
 * Generate all possible combinations from variant attributes
 * @param {Array} variantAttributes - Array of variant attribute objects
 * @returns {Array} Array of all possible combinations
 */
export const generateAllCombinations = (variantAttributes) => {
    if (!variantAttributes || variantAttributes.length === 0) {
        return [];
    }

    // Get active values for each attribute
    const attributeValues = variantAttributes.map(attr => ({
        name: attr.name,
        values: attr.values.filter(v => v.isActive).map(v => v.value)
    }));

    // Generate cartesian product
    const combinations = [];
    
    const generateRecursive = (current, remaining) => {
        if (remaining.length === 0) {
            combinations.push({ ...current });
            return;
        }

        const [first, ...rest] = remaining;
        first.values.forEach(value => {
            generateRecursive(
                { ...current, [first.name]: value },
                rest
            );
        });
    };

    generateRecursive({}, attributeValues);
    return combinations;
};

/**
 * Validate that all required attributes are selected
 * @param {Array} variantAttributes - Product variant attributes
 * @param {Object} selections - User selections
 * @returns {Object} Validation result
 */
export const validateAttributeSelections = (variantAttributes, selections) => {
    const errors = [];
    const requiredAttributes = variantAttributes.filter(attr => attr.isRequired);

    requiredAttributes.forEach(attr => {
        if (!selections[attr.name]) {
            errors.push(`${attr.displayName || attr.name} is required`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Find variant combination by attribute selections
 * @param {Array} variantCombinations - Product variant combinations
 * @param {Object} attributeSelections - Selected attributes
 * @returns {Object|null} Found combination or null
 */
export const findVariantCombination = (variantCombinations, attributeSelections) => {
    const combinationKey = generateCombinationKey(attributeSelections);
    return variantCombinations.find(combo => combo.combinationKey === combinationKey) || null;
};

/**
 * Get available attribute values based on current selections and stock
 * @param {Array} variantAttributes - Product variant attributes
 * @param {Array} variantCombinations - Product variant combinations
 * @param {Object} currentSelections - Current user selections
 * @param {string} targetAttribute - Attribute to get available values for
 * @returns {Array} Available values for the target attribute
 */
export const getAvailableAttributeValues = (variantAttributes, variantCombinations, currentSelections, targetAttribute) => {
    const targetAttr = variantAttributes.find(attr => attr.name === targetAttribute);
    if (!targetAttr) return [];

    // If no combinations exist, return all active values
    if (!variantCombinations || variantCombinations.length === 0) {
        return targetAttr.values.filter(v => v.isActive);
    }

    // Filter combinations that match current selections (excluding target attribute)
    const otherSelections = { ...currentSelections };
    delete otherSelections[targetAttribute];

    const availableValues = new Set();

    variantCombinations.forEach(combo => {
        // Check if combination is active and in stock
        if (!combo.isActive || combo.stockQuantity <= 0) return;

        // Check if combination matches other selections
        const matchesOtherSelections = Object.keys(otherSelections).every(key => {
            const comboAttr = combo.attributes.find(attr => attr.attributeName === key);
            return comboAttr && comboAttr.attributeValue === otherSelections[key];
        });

        if (matchesOtherSelections) {
            const targetAttr = combo.attributes.find(attr => attr.attributeName === targetAttribute);
            if (targetAttr) {
                availableValues.add(targetAttr.attributeValue);
            }
        }
    });

    // Return only values that are available and active
    return targetAttr.values.filter(v => 
        v.isActive && availableValues.has(v.value)
    );
};

/**
 * Calculate total stock for a product with variants
 * @param {Object} product - Product object
 * @returns {number} Total stock quantity
 */
export const calculateTotalStock = (product) => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) {
        return product.stockQuantity || 0;
    }

    return product.variantCombinations.reduce((total, combo) => {
        return total + (combo.isActive ? combo.stockQuantity : 0);
    }, 0);
};

/**
 * Get effective price for a variant combination
 * @param {Object} product - Product object
 * @param {Object} combination - Variant combination
 * @returns {number} Effective price
 */
export const getEffectivePrice = (product, combination = null) => {
    if (!combination) {
        return product.salePrice || product.price;
    }
    
    return combination.salePrice || combination.price || product.salePrice || product.price;
};

/**
 * Check if a product is in stock (considering variants)
 * @param {Object} product - Product object
 * @param {Object} attributeSelections - Selected attributes (optional)
 * @returns {boolean} Whether product is in stock
 */
export const isProductInStock = (product, attributeSelections = null) => {
    if (attributeSelections && product.variantCombinations) {
        const combination = findVariantCombination(product.variantCombinations, attributeSelections);
        return combination ? combination.isActive && combination.stockQuantity > 0 : false;
    }

    if (product.variantCombinations && product.variantCombinations.length > 0) {
        return product.variantCombinations.some(combo => combo.isActive && combo.stockQuantity > 0);
    }

    return product.stockQuantity > 0;
};

/**
 * Format variant display name for UI
 * @param {Object} combination - Variant combination
 * @param {Array} variantAttributes - Product variant attributes
 * @returns {string} Formatted display name
 */
export const formatVariantDisplayName = (combination, variantAttributes) => {
    if (!combination || !combination.attributes) return '';

    return combination.attributes.map(attr => {
        const attrDef = variantAttributes.find(va => va.name === attr.attributeName);
        const valueDef = attrDef?.values.find(v => v.value === attr.attributeValue);
        
        const attrName = attrDef?.displayName || attr.attributeName;
        const valueName = valueDef?.displayName || attr.attributeValue;
        
        return `${attrName}: ${valueName}`;
    }).join(', ');
};
