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

/**
 * Generate product meta description
 * @param {string} name - Product name
 * @param {string} description - Product description
 * @param {number} price - Product price
 * @returns {string} - Meta description
 */
export const generateMetaDescription = (name, description, price) => {
    const shortDesc = truncateText(description, 120);
    const priceText = formatPrice(price, '');
    return `${name} - ${shortDesc} Giá chỉ ${priceText}đ. Miễn phí giao hàng. Mua ngay!`;
};

/**
 * Generate product meta title
 * @param {string} name - Product name
 * @param {string} brand - Product brand
 * @param {string} category - Product category
 * @returns {string} - Meta title
 */
export const generateMetaTitle = (name, brand, category) => {
    let title = name;
    if (brand) title += ` - ${brand}`;
    if (category) title += ` | ${category}`;
    title += ' - Petopia';
    return truncateText(title, 60);
};

/**
 * Generate coupon code
 * @param {string} prefix - Code prefix
 * @param {number} length - Code length
 * @returns {string} - Generated coupon code
 */
export const generateCouponCode = (prefix = 'COUPON', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix + '-';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Format Vietnamese currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export const formatVND = (amount) => {
    if (typeof amount !== 'number') return '0đ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Extract keywords from text for search
 * @param {string} text - Text to extract keywords from
 * @returns {Array} - Array of keywords
 */
export const extractKeywords = (text) => {
    if (!text) return [];
    
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 20); // Limit to 20 keywords
};

/**
 * Clean and normalize text for search
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export const normalizeSearchText = (text) => {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Generate breadcrumb text
 * @param {Array} categories - Array of category objects
 * @returns {string} - Breadcrumb text
 */
export const generateBreadcrumb = (categories) => {
    if (!categories || categories.length === 0) return '';
    return categories.map(cat => cat.name).join(' > ');
};

/**
 * Validate and clean phone number
 * @param {string} phone - Phone number to clean
 * @returns {string} - Cleaned phone number
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Generate order status text in Vietnamese
 * @param {string} status - Order status
 * @returns {string} - Vietnamese status text
 */
export const getOrderStatusText = (status) => {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang xử lý',
        'shipped': 'Đã giao hàng',
        'delivered': 'Đã nhận hàng',
        'cancelled': 'Đã hủy',
        'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
};

/**
 * Generate notification title
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @returns {string} - Notification title
 */
export const generateNotificationTitle = (type, data = {}) => {
    const titleMap = {
        'order_placed': 'Đơn hàng mới',
        'order_confirmed': 'Đơn hàng đã xác nhận',
        'order_shipped': 'Đơn hàng đang giao',
        'order_delivered': 'Đơn hàng đã giao',
        'order_cancelled': 'Đơn hàng đã hủy',
        'payment_received': 'Thanh toán thành công',
        'product_back_in_stock': 'Sản phẩm đã có hàng',
        'coupon_expiring': 'Mã giảm giá sắp hết hạn',
        'welcome': 'Chào mừng bạn đến với Petopia',
        'system': 'Thông báo hệ thống'
    };
    return titleMap[type] || 'Thông báo';
};
