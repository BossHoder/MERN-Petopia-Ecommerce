import fs from 'fs';
import { promisify } from 'util';
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

export const deleteAllAvatars = async (absoluteFolderPath) => {
  try {
    const files = await readdir(absoluteFolderPath);
    const unlinkPromises = files.map((filename) => {
      if (!['avatar0.jpg', 'avatar1.jpg', 'avatar2.jpg'].includes(filename)) {
        console.log('Deleting avatar: ', filename);
        unlink(`${absoluteFolderPath}/${filename}`);
      }
    });
    return Promise.all(unlinkPromises);
  } catch (err) {
    console.log(err);
  }
};

export const isValidUrl = (str) => {
  var urlRegex =
    '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove empty properties from object
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
export const removeEmptyProperties = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

/**
 * Format currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format date for Vietnamese locale
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Format phone number (Vietnamese format)
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Convert to standard format: 0xxx xxx xxx
  return phone.replace(/(\+84|84)/, '0').replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} - Age in years
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone number
 */
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate order number
 * @returns {string} - Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Calculate discount amount
 * @param {number} price - Original price
 * @param {number} discount - Discount value
 * @param {string} type - Discount type ('percentage' or 'fixed')
 * @returns {number} - Discount amount
 */
export const calculateDiscount = (price, discount, type) => {
  if (type === 'percentage') {
    return (price * discount) / 100;
  }
  return discount;
};

/**
 * Check if date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} - Is expired
 */
export const isExpired = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get time difference in readable format
 * @param {Date} date - Date to compare
 * @returns {string} - Time difference
 */
export const getTimeDifference = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized content
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Parse sort parameter
 * @param {string} sortParam - Sort parameter (e.g., 'name:asc', 'price:desc')
 * @returns {Object} - Sort object for MongoDB
 */
export const parseSortParam = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };
  
  const [field, order] = sortParam.split(':');
  return { [field]: order === 'desc' ? -1 : 1 };
};

/**
 * Build pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} - Pagination object
 */
export const buildPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};
