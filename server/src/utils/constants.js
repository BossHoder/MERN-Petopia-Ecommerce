export const IMAGES_FOLDER_PATH = '/public/images/';

// Order Status Constants
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Payment Method Constants
export const PAYMENT_METHODS = {
    COD: 'cod',
    CREDIT_CARD: 'credit_card',
    BANK_TRANSFER: 'bank_transfer',
    MOMO: 'momo',
    ZALOPAY: 'zalopay'
};

// Coupon Constants
export const COUPON_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
};

// Notification Constants
export const NOTIFICATION_TYPES = {
    ORDER_PLACED: 'order_placed',
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',
    PAYMENT_RECEIVED: 'payment_received',
    PRODUCT_BACK_IN_STOCK: 'product_back_in_stock',
    COUPON_EXPIRING: 'coupon_expiring',
    WELCOME: 'welcome',
    SYSTEM: 'system'
};

// User Role Constants
export const USER_ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer'
};

// Gender Constants
export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other'
};

// Address Type Constants
export const ADDRESS_TYPES = {
    HOME: 'home',
    WORK: 'work',
    OTHER: 'other'
};

// Shipping Constants
export const SHIPPING_CONFIG = {
    FREE_SHIPPING_THRESHOLD: 200000, // 200k VND
    DEFAULT_SHIPPING_COST: 20000, // 20k VND
    ESTIMATED_DELIVERY_DAYS: 3
};

// Business Constants
export const BUSINESS_RULES = {
    MAX_CART_ITEMS: 100,
    MAX_WISHLIST_ITEMS: 500,
    DEFAULT_LOW_STOCK_THRESHOLD: 10,
    GUEST_CART_EXPIRY_DAYS: 7,
    USER_CART_EXPIRY_DAYS: 30,
    RETURN_POLICY_DAYS: 7,
    MAX_PRODUCT_IMAGES: 10,
    MAX_PRODUCT_VARIANTS: 20,
    MAX_COUPON_USAGE: 1000
};

// Validation Constants
export const VALIDATION_RULES = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 255,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_PRODUCT_NAME_LENGTH: 2,
    MAX_PRODUCT_NAME_LENGTH: 200,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 2000,
    VIETNAMESE_PHONE_REGEX: /^(\+84|84|0)(3|5|7|8|9)\d{8}$/
};
