import stockService from '../services/stockService.js';
import { validationErrorResponse, errorResponse } from '../helpers/responseHelper.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Middleware to validate stock availability before order creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateStockAvailability = async (req, res, next) => {
    try {
        const { orderItems } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return validationErrorResponse(res, ERROR_MESSAGES.NO_ORDER_ITEMS);
        }

        // Prepare order items for stock validation
        const itemsForValidation = orderItems.map((item) => ({
            product: item.product?._id || item.productId,
            productId: item.product?._id || item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
        }));

        // Validate stock availability
        const stockValidation = await stockService.validateStockAvailability(itemsForValidation);

        if (!stockValidation.success) {
            return validationErrorResponse(res, 'Stock validation failed', {
                errors: stockValidation.errors,
                details: 'One or more items in your order are not available in the requested quantity',
            });
        }

        // Attach stock info to request for use in order creation
        req.stockInfo = stockValidation.stockInfo;
        next();
    } catch (error) {
        console.error('Stock validation middleware error:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
};

/**
 * Middleware to reserve stock during order creation
 * Should be used after validateStockAvailability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const reserveStockForOrder = async (req, res, next) => {
    try {
        const { orderItems } = req.body;

        // Prepare order items for stock reservation
        const itemsForReservation = orderItems.map((item) => ({
            product: item.product?._id || item.productId,
            productId: item.product?._id || item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
        }));

        // Reserve stock
        const reservationResult = await stockService.reserveStock(itemsForReservation);

        if (!reservationResult.success) {
            return errorResponse(res, 'Failed to reserve stock for order', 400, {
                error: reservationResult.error,
                details: 'Stock reservation failed. Please try again.',
            });
        }

        // Attach reservation info to request
        req.stockReserved = true;
        req.reservedItems = itemsForReservation;
        next();
    } catch (error) {
        console.error('Stock reservation middleware error:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
};

/**
 * Error handler middleware to restore stock if order creation fails
 * Should be used as error handling middleware after stock reservation
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const restoreStockOnError = async (error, req, res, next) => {
    try {
        // If stock was reserved but order creation failed, restore the stock
        if (req.stockReserved && req.reservedItems) {
            console.log('Order creation failed, restoring reserved stock...');

            const restoreResult = await stockService.restoreStock(req.reservedItems);

            if (!restoreResult.success) {
                console.error('Failed to restore stock after order creation failure:', restoreResult.error);
                // Log this as a critical error but don't change the original error response
            } else {
                console.log('Stock successfully restored after order creation failure');
            }
        }

        // Continue with the original error
        next(error);
    } catch (restoreError) {
        console.error('Error in stock restoration middleware:', restoreError);
        // Continue with the original error, don't mask it
        next(error);
    }
};

/**
 * Middleware to check if user can modify order (for cancellation/refund)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateOrderModification = async (req, res, next) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Define statuses that require stock restoration
        const stockRestorationStatuses = ['cancelled', 'refunded'];

        if (stockRestorationStatuses.includes(status)) {
            // Attach flag to request for later use
            req.requiresStockRestoration = true;
        }

        next();
    } catch (error) {
        console.error('Order modification validation error:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
};

/**
 * Utility function to get stock summary for admin dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStockSummary = async (req, res) => {
    try {
        const { threshold } = req.query;

        const lowStockResult = await stockService.getLowStockProducts(threshold ? parseInt(threshold) : null);

        if (!lowStockResult.success) {
            return errorResponse(res, 'Failed to fetch stock summary', 500);
        }

        const summary = {
            lowStockItems: lowStockResult.data,
            totalLowStockItems: lowStockResult.data.length,
            outOfStockItems: lowStockResult.data.filter((item) => item.stockQuantity === 0),
            criticalStockItems: lowStockResult.data.filter((item) => item.stockQuantity <= 5),
        };

        return res.status(200).json({
            success: true,
            data: summary,
            message: 'Stock summary retrieved successfully',
        });
    } catch (error) {
        console.error('Stock summary error:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
};
