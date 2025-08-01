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
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    
    // Uppercase vowels with diacritics
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    
    // Special Vietnamese consonant
    'đ': 'd', 'Đ': 'D',
    
    // Additional common diacritics (for completeness)
    'ç': 'c', 'Ç': 'C',
    'ñ': 'n', 'Ñ': 'N',
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
        .map(char => VIETNAMESE_CHAR_MAP[char] || char)
        .join('');
};

/**
 * Generate URL-friendly slug from Vietnamese text
 * @param {string} text - Input text (Vietnamese or English)
 * @param {Object} options - Configuration options
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text, options = {}) => {
    const {
        maxLength = 100,
        separator = '-',
        lowercase = true,
    } = options;
    
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
        if (lastSeparator > maxLength * 0.8) { // Only trim if separator is near the end
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
            message: 'Slug can only contain lowercase letters, numbers, and hyphens. No consecutive hyphens or hyphens at start/end.',
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
        console.log(`${passed ? '✅' : '❌'} "${input}" → "${result}" ${passed ? '' : `(expected: "${expected}")`}`);
    });
};

export default {
    removeVietnameseDiacritics,
    generateSlug,
    generateUniqueSlug,
    validateSlug,
    createDebouncedSlugGenerator,
    testVietnameseSlugGeneration,
};
