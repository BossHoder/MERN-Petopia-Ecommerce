/**
 * Vietnamese-compatible slug generation utilities
 * Handles Vietnamese diacritics and special characters properly
 */

/**
 * Comprehensive Vietnamese character mapping
 * Maps Vietnamese characters with diacritics to their base Latin equivalents
 */
const VIETNAMESE_CHAR_MAP = {
    // Lowercase vowels with diacritics
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    ă: 'a',
    ằ: 'a',
    ắ: 'a',
    ẳ: 'a',
    ẵ: 'a',
    ặ: 'a',
    â: 'a',
    ầ: 'a',
    ấ: 'a',
    ẩ: 'a',
    ẫ: 'a',
    ậ: 'a',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    ê: 'e',
    ề: 'e',
    ế: 'e',
    ể: 'e',
    ễ: 'e',
    ệ: 'e',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    õ: 'o',
    ọ: 'o',
    ô: 'o',
    ồ: 'o',
    ố: 'o',
    ổ: 'o',
    ỗ: 'o',
    ộ: 'o',
    ơ: 'o',
    ờ: 'o',
    ớ: 'o',
    ở: 'o',
    ỡ: 'o',
    ợ: 'o',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    ư: 'u',
    ừ: 'u',
    ứ: 'u',
    ử: 'u',
    ữ: 'u',
    ự: 'u',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',

    // Uppercase vowels with diacritics
    À: 'A',
    Á: 'A',
    Ả: 'A',
    Ã: 'A',
    Ạ: 'A',
    Ă: 'A',
    Ằ: 'A',
    Ắ: 'A',
    Ẳ: 'A',
    Ẵ: 'A',
    Ặ: 'A',
    Â: 'A',
    Ầ: 'A',
    Ấ: 'A',
    Ẩ: 'A',
    Ẫ: 'A',
    Ậ: 'A',
    È: 'E',
    É: 'E',
    Ẻ: 'E',
    Ẽ: 'E',
    Ẹ: 'E',
    Ê: 'E',
    Ề: 'E',
    Ế: 'E',
    Ể: 'E',
    Ễ: 'E',
    Ệ: 'E',
    Ì: 'I',
    Í: 'I',
    Ỉ: 'I',
    Ĩ: 'I',
    Ị: 'I',
    Ò: 'O',
    Ó: 'O',
    Ỏ: 'O',
    Õ: 'O',
    Ọ: 'O',
    Ô: 'O',
    Ồ: 'O',
    Ố: 'O',
    Ổ: 'O',
    Ỗ: 'O',
    Ộ: 'O',
    Ơ: 'O',
    Ờ: 'O',
    Ớ: 'O',
    Ở: 'O',
    Ỡ: 'O',
    Ợ: 'O',
    Ù: 'U',
    Ú: 'U',
    Ủ: 'U',
    Ũ: 'U',
    Ụ: 'U',
    Ư: 'U',
    Ừ: 'U',
    Ứ: 'U',
    Ử: 'U',
    Ữ: 'U',
    Ự: 'U',
    Ỳ: 'Y',
    Ý: 'Y',
    Ỷ: 'Y',
    Ỹ: 'Y',
    Ỵ: 'Y',

    // Special Vietnamese consonant
    đ: 'd',
    Đ: 'D',

    // Additional common diacritics (for completeness)
    ç: 'c',
    Ç: 'C',
    ñ: 'n',
    Ñ: 'N',
};

/**
 * Remove Vietnamese diacritics from text
 * @param {string} text - Input text with Vietnamese characters
 * @returns {string} Text with diacritics removed
 */
export const removeVietnameseDiacritics = (text) => {
    if (!text || typeof text !== 'string') return '';

    return text
        .split('')
        .map((char) => VIETNAMESE_CHAR_MAP[char] || char)
        .join('');
};

/**
 * Generate URL-friendly slug from Vietnamese text
 * @param {string} text - Input text (Vietnamese or English)
 * @param {Object} options - Configuration options
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text, options = {}) => {
    const { maxLength = 100, separator = '-', lowercase = true } = options;

    if (!text || typeof text !== 'string') return '';

    let slug = text.trim();

    // Step 1: Remove Vietnamese diacritics
    slug = removeVietnameseDiacritics(slug);

    // Step 2: Convert to lowercase if specified
    if (lowercase) {
        slug = slug.toLowerCase();
    }

    // Step 3: Replace spaces and special characters with separator
    slug = slug
        .replace(/[\s\W_]+/g, separator) // Replace spaces and non-word chars with separator
        .replace(new RegExp(`\\${separator}+`, 'g'), separator) // Remove consecutive separators
        .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), ''); // Trim separators from start/end

    // Step 4: Limit length if specified
    if (maxLength && slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
        // Ensure we don't cut in the middle of a word
        const lastSeparator = slug.lastIndexOf(separator);
        if (lastSeparator > maxLength * 0.8) {
            // Only trim if separator is near the end
            slug = slug.substring(0, lastSeparator);
        }
    }

    // Step 5: Final cleanup - remove trailing separators
    slug = slug.replace(new RegExp(`\\${separator}+$`, 'g'), '');

    return slug;
};

/**
 * Generate unique slug by appending number if needed
 * @param {string} baseSlug - Base slug to make unique
 * @param {Function} checkExists - Function to check if slug exists (should return Promise<boolean>)
 * @param {number} maxAttempts - Maximum attempts to find unique slug
 * @returns {Promise<string>} Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists, maxAttempts = 100) => {
    if (!baseSlug) return '';

    let slug = baseSlug;
    let counter = 1;

    // Check if base slug is available
    try {
        const exists = await checkExists(slug);
        if (!exists) {
            return slug;
        }
    } catch (error) {
        console.warn('Error checking slug existence:', error);
        return slug; // Return base slug if check fails
    }

    // Try with numbered suffixes
    while (counter <= maxAttempts) {
        slug = `${baseSlug}-${counter}`;

        try {
            const exists = await checkExists(slug);
            if (!exists) {
                return slug;
            }
        } catch (error) {
            console.warn('Error checking slug existence:', error);
            return slug; // Return current slug if check fails
        }

        counter++;
    }

    // If all attempts failed, return slug with timestamp
    return `${baseSlug}-${Date.now()}`;
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateSlug = (slug) => {
    if (!slug || typeof slug !== 'string') {
        return {
            isValid: false,
            message: 'Slug is required',
        };
    }

    // Check for valid slug pattern (letters, numbers, hyphens only)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugPattern.test(slug)) {
        return {
            isValid: false,
            message:
                'Slug can only contain lowercase letters, numbers, and hyphens. No consecutive hyphens or hyphens at start/end.',
        };
    }

    // Check length
    if (slug.length < 2) {
        return {
            isValid: false,
            message: 'Slug must be at least 2 characters long',
        };
    }

    if (slug.length > 100) {
        return {
            isValid: false,
            message: 'Slug must be less than 100 characters long',
        };
    }

    return {
        isValid: true,
        message: 'Valid slug',
    };
};

/**
 * Create a debounced slug generator for real-time input
 * @param {Function} callback - Function to call with generated slug
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced slug generator function
 */
export const createDebouncedSlugGenerator = (callback, delay = 300) => {
    let timeoutId;

    return (text) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const slug = generateSlug(text);
            callback(slug);
        }, delay);
    };
};

/**
 * Generate SKU from Vietnamese text
 * @param {string} text - Input text (Vietnamese or English)
 * @param {Object} options - Configuration options
 * @returns {string} Generated SKU
 */
export const generateSku = (text, options = {}) => {
    const { includeNumbers = true, minLength = 6, maxLength = 8, seed = null } = options;

    if (!text || typeof text !== 'string') return '';

    // Step 1: Remove Vietnamese diacritics and convert to uppercase
    let cleanText = removeVietnameseDiacritics(text).toUpperCase();

    // Step 2: Split into words and get first 3 letters of each significant word
    const words = cleanText
        .split(/\s+/)
        .filter((word) => word.length > 2) // Only significant words
        .slice(0, 3); // Maximum 3 words for SKU

    let skuBase = '';

    if (words.length === 0) {
        // Fallback: use first 3 characters of cleaned text
        skuBase = cleanText.replace(/[^A-Z0-9]/g, '').substring(0, 3);
    } else {
        // Get first 3 letters from each word (or 2 if word is short)
        skuBase = words
            .map((word) => {
                const letters = word.replace(/[^A-Z]/g, '');
                return letters.substring(0, Math.min(3, Math.max(1, letters.length)));
            })
            .join('');
    }

    // Step 3: Ensure minimum length
    if (skuBase.length < 3) {
        skuBase = skuBase.padEnd(3, 'X');
    }

    // Step 4: Add deterministic numbers if enabled
    if (includeNumbers) {
        const numbersNeeded = Math.max(0, minLength - skuBase.length);
        if (numbersNeeded > 0) {
            let numbers;
            if (seed !== null) {
                // Use seed for deterministic generation
                numbers = seed.toString().padStart(numbersNeeded, '0').substring(0, numbersNeeded);
            } else {
                // Generate deterministic numbers based on text hash
                let hash = 0;
                for (let i = 0; i < cleanText.length; i++) {
                    const char = cleanText.charCodeAt(i);
                    hash = (hash << 5) - hash + char;
                    hash = hash & hash; // Convert to 32-bit integer
                }
                // Use absolute value and ensure it's positive
                const positiveHash = Math.abs(hash);
                numbers = (positiveHash % Math.pow(10, numbersNeeded))
                    .toString()
                    .padStart(numbersNeeded, '0');
            }
            skuBase += numbers;
        }
    }

    // Step 5: Limit to max length
    if (maxLength && skuBase.length > maxLength) {
        skuBase = skuBase.substring(0, maxLength);
    }

    return skuBase;
};

/**
 * Generate unique SKU by appending number if needed
 * @param {string} baseSku - Base SKU to make unique
 * @param {Function} checkExists - Function to check if SKU exists (should return Promise<boolean>)
 * @param {number} maxAttempts - Maximum attempts to find unique SKU
 * @returns {Promise<string>} Unique SKU
 */
export const generateUniqueSku = async (baseSku, checkExists, maxAttempts = 100) => {
    if (!baseSku) return '';

    let sku = baseSku;
    let counter = 1;

    // Check if base SKU is available
    try {
        const exists = await checkExists(sku);
        if (!exists) {
            return sku;
        }
    } catch (error) {
        console.warn('Error checking SKU existence:', error);
        return sku; // Return base SKU if check fails
    }

    // Try with numbered suffixes
    while (counter <= maxAttempts) {
        // For SKU, we append numbers at the end, replacing last digits if needed
        const baseLength = Math.max(3, baseSku.length - 2);
        const basePrefix = baseSku.substring(0, baseLength);
        sku = basePrefix + counter.toString().padStart(2, '0');

        try {
            const exists = await checkExists(sku);
            if (!exists) {
                return sku;
            }
        } catch (error) {
            console.warn('Error checking SKU existence:', error);
            return sku; // Return current SKU if check fails
        }

        counter++;
    }

    // If all attempts failed, return SKU with timestamp
    const timestamp = Date.now().toString().slice(-4);
    return baseSku.substring(0, 4) + timestamp;
};

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateSku = (sku) => {
    if (!sku || typeof sku !== 'string') {
        return {
            isValid: false,
            message: 'SKU is required',
        };
    }

    // Check for valid SKU pattern (uppercase letters and numbers only)
    const skuPattern = /^[A-Z0-9]+$/;

    if (!skuPattern.test(sku)) {
        return {
            isValid: false,
            message: 'SKU can only contain uppercase letters and numbers',
        };
    }

    // Check length
    if (sku.length < 3) {
        return {
            isValid: false,
            message: 'SKU must be at least 3 characters long',
        };
    }

    if (sku.length > 20) {
        return {
            isValid: false,
            message: 'SKU must be less than 20 characters long',
        };
    }

    return {
        isValid: true,
        message: 'Valid SKU',
    };
};

/**
 * Create a debounced SKU generator for real-time input
 * @param {Function} callback - Function to call with generated SKU
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced SKU generator function
 */
export const createDebouncedSkuGenerator = (callback, delay = 300) => {
    let timeoutId;

    return (text) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const sku = generateSku(text);
            callback(sku);
        }, delay);
    };
};

/**
 * Test cases for Vietnamese slug generation
 * Used for development and testing purposes
 */
export const testVietnameseSlugGeneration = () => {
    const testCases = [
        { input: 'Đồ cho mèo', expected: 'do-cho-meo' },
        { input: 'Thức ăn cho chó', expected: 'thuc-an-cho-cho' },
        { input: 'Phụ kiện thú cưng', expected: 'phu-kien-thu-cung' },
        { input: 'Áo quần thời trang', expected: 'ao-quan-thoi-trang' },
        { input: 'Đồ chơi giải trí', expected: 'do-choi-giai-tri' },
        { input: 'Sản phẩm chăm sóc', expected: 'san-pham-cham-soc' },
        { input: 'Thương hiệu nổi tiếng', expected: 'thuong-hieu-noi-tieng' },
        { input: 'Giá cả phải chăng', expected: 'gia-ca-phai-chang' },
    ];

    console.log('Vietnamese Slug Generation Test Results:');
    testCases.forEach(({ input, expected }) => {
        const result = generateSlug(input);
        const passed = result === expected;
        console.log(
            `${passed ? '✅' : '❌'} "${input}" → "${result}" ${
                passed ? '' : `(expected: "${expected}")`
            }`,
        );
    });
};

/**
 * Test cases for Vietnamese SKU generation
 * Used for development and testing purposes
 */
export const testVietnameseSkuGeneration = () => {
    const testCases = [
        { input: 'Đồ cho mèo', expectedPattern: /^DCM\d{4}$/ },
        { input: 'Thức ăn cho chó', expectedPattern: /^TAC\d{3}$/ },
        { input: 'Phụ kiện thú cưng', expectedPattern: /^PKT\d{3}$/ },
        { input: 'Áo quần thời trang', expectedPattern: /^AQT\d{3}$/ },
        { input: 'Đồ chơi giải trí', expectedPattern: /^DCG\d{3}$/ },
        { input: 'Sản phẩm chăm sóc', expectedPattern: /^SPC\d{3}$/ },
        { input: 'Thương hiệu nổi tiếng', expectedPattern: /^THN\d{3}$/ },
        { input: 'Giá cả phải chăng', expectedPattern: /^GCP\d{3}$/ },
    ];

    console.log('Vietnamese SKU Generation Test Results:');
    testCases.forEach(({ input, expectedPattern }) => {
        const result = generateSku(input);
        const passed = expectedPattern.test(result);
        console.log(
            `${passed ? '✅' : '❌'} "${input}" → "${result}" ${
                passed ? '' : `(pattern: ${expectedPattern})`
            }`,
        );
    });
};

export default {
    removeVietnameseDiacritics,
    generateSlug,
    generateUniqueSlug,
    validateSlug,
    createDebouncedSlugGenerator,
    generateSku,
    generateUniqueSku,
    validateSku,
    createDebouncedSkuGenerator,
    testVietnameseSlugGeneration,
    testVietnameseSkuGeneration,
};
