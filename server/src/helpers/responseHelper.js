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
