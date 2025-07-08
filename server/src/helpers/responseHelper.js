/**
 * Standardized API response helpers
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Detailed errors
 */
export const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Object} data - Paginated data from aggregation
 * @param {string} message - Success message
 */
export const paginatedResponse = (res, data, message = 'Success') => {
    const response = {
        success: true,
        message,
        data: data.data || [],
        pagination: {
            page: data.page || 1,
            limit: data.limit || 20,
            totalCount: data.totalCount || 0,
            totalPages: data.totalPages || 0,
            hasNextPage: (data.page || 1) < (data.totalPages || 0),
            hasPrevPage: (data.page || 1) > 1
        },
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Object} error - Joi validation error
 */
export const validationErrorResponse = (res, error) => {
    const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
    }));

    return errorResponse(res, 'Validation failed', 400, errors);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
export const notFoundResponse = (res, resource = 'Resource') => {
    return errorResponse(res, `${resource} not found`, 404);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const forbiddenResponse = (res, message = 'Access forbidden') => {
    return errorResponse(res, message, 403);
};

/**
 * Created response (HTTP 201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
export const createdResponse = (res, data, message = 'Created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * No content response (HTTP 204)
 * @param {Object} res - Express response object
 */
export const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Conflict response (HTTP 409)
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 */
export const conflictResponse = (res, message = 'Resource already exists') => {
    return errorResponse(res, message, 409);
};

/**
 * Too many requests response (HTTP 429)
 * @param {Object} res - Express response object
 * @param {string} message - Rate limit message
 */
export const tooManyRequestsResponse = (res, message = 'Too many requests') => {
    return errorResponse(res, message, 429);
};

/**
 * Service unavailable response (HTTP 503)
 * @param {Object} res - Express response object
 * @param {string} message - Service message
 */
export const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
    return errorResponse(res, message, 503);
};

/**
 * Cart response with totals
 * @param {Object} res - Express response object
 * @param {Object} cart - Cart data
 * @param {string} message - Success message
 */
export const cartResponse = (res, cart, message = 'Cart retrieved successfully') => {
    return successResponse(res, {
        cart,
        summary: {
            totalItems: cart.totalItems,
            totalUniqueItems: cart.totalUniqueItems,
            isEmpty: cart.isEmpty,
            totals: cart.totals
        }
    }, message);
};

/**
 * Order response with status
 * @param {Object} res - Express response object
 * @param {Object} order - Order data
 * @param {string} message - Success message
 */
export const orderResponse = (res, order, message = 'Order processed successfully') => {
    return successResponse(res, {
        order,
        status: {
            current: order.status,
            canBeCancelled: order.canBeCancelled,
            canBeRefunded: order.canBeRefunded,
            isPaid: order.isPaid,
            isDelivered: order.isDelivered
        }
    }, message);
};

/**
 * Product response with analytics
 * @param {Object} res - Express response object
 * @param {Object} product - Product data
 * @param {Object} analytics - Product analytics
 * @param {string} message - Success message
 */
export const productResponse = (res, product, analytics = null, message = 'Product retrieved successfully') => {
    const response = { product };
    if (analytics) {
        response.analytics = analytics;
    }
    return successResponse(res, response, message);
};

/**
 * User profile response
 * @param {Object} res - Express response object
 * @param {Object} user - User data
 * @param {Object} stats - User statistics
 * @param {string} message - Success message
 */
export const userProfileResponse = (res, user, stats = null, message = 'Profile retrieved successfully') => {
    const response = { user };
    if (stats) {
        response.stats = stats;
    }
    return successResponse(res, response, message);
};

/**
 * Search response with filters
 * @param {Object} res - Express response object
 * @param {Object} results - Search results
 * @param {Object} filters - Applied filters
 * @param {string} message - Success message
 */
export const searchResponse = (res, results, filters = {}, message = 'Search completed successfully') => {
    return successResponse(res, {
        results: results.data || results,
        filters: filters,
        pagination: results.pagination || null,
        total: results.total || (results.data ? results.data.length : 0)
    }, message);
};

/**
 * Authentication response
 * @param {Object} res - Express response object
 * @param {Object} user - User data
 * @param {string} token - JWT token
 * @param {string} message - Success message
 */
export const authResponse = (res, user, token, message = 'Authentication successful') => {
    return successResponse(res, {
        user,
        token,
        expiresIn: '24h'
    }, message);
};

/**
 * Coupon response
 * @param {Object} res - Express response object
 * @param {Object} coupon - Coupon data
 * @param {Object} discount - Discount calculation
 * @param {string} message - Success message
 */
export const couponResponse = (res, coupon, discount = null, message = 'Coupon applied successfully') => {
    const response = { coupon };
    if (discount) {
        response.discount = discount;
    }
    return successResponse(res, response, message);
};

/**
 * Analytics response
 * @param {Object} res - Express response object
 * @param {Object} analytics - Analytics data
 * @param {string} period - Analytics period
 * @param {string} message - Success message
 */
export const analyticsResponse = (res, analytics, period = 'all', message = 'Analytics retrieved successfully') => {
    return successResponse(res, {
        analytics,
        period,
        generatedAt: new Date().toISOString()
    }, message);
};

/**
 * Batch operation response
 * @param {Object} res - Express response object
 * @param {Array} results - Batch operation results
 * @param {string} message - Success message
 */
export const batchResponse = (res, results, message = 'Batch operation completed') => {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return successResponse(res, {
        results,
        summary: {
            total: results.length,
            successful,
            failed
        }
    }, `${message}. ${successful} successful, ${failed} failed`);
};
