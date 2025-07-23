// Mapping backend error code/message to i18n key
// Có thể mở rộng thêm các code/message khác nếu backend bổ sung

const errorCodeMap = {
    VALIDATION_ERROR: 'errors.validation',
    PRODUCT_NOT_FOUND: 'errors.productNotFound',
    CART_NOT_FOUND: 'errors.cartNotFound',
    ORDER_NOT_FOUND: 'errors.orderNotFound',
    USER_NOT_FOUND: 'errors.userNotFound',
    CATEGORY_NOT_FOUND: 'errors.categoryNotFound',
    COUPON_NOT_FOUND: 'errors.couponNotFound',
    UNAUTHORIZED: 'errors.unauthorized',
    FORBIDDEN: 'errors.forbidden',
    INTERNAL_SERVER_ERROR: 'errors.internal',
    NOT_ENOUGH_STOCK: 'errors.notEnoughStock',
    ALREADY_REVIEWED: 'errors.alreadyReviewed',
    SKU_EXISTS: 'errors.skuExists',
    SLUG_EXISTS: 'errors.slugExists',
    COUPON_INVALID: 'errors.couponInvalid',
    ACCESS_DENIED: 'errors.accessDenied',
    ADDRESS_NOT_FOUND: 'errors.addressNotFound',
    TOO_MANY_REQUESTS: 'errors.tooManyRequests',
    SERVICE_UNAVAILABLE: 'errors.serviceUnavailable',
    // ... add more as needed
};

export default errorCodeMap;
