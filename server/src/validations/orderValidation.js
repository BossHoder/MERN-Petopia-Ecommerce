import Joi from 'joi';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

/**
 * Order validation schemas
 */

export const createOrderSchema = Joi.object({
    username: Joi.string().trim().required().messages({
        'any.required': ERROR_MESSAGES.USER_ID_REQUIRED,
    }),

    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                variantId: Joi.string().optional(),
                productName: Joi.string().required(),
                image: Joi.string().required(),
                price: Joi.number().positive().required(),
                quantity: Joi.number().integer().min(1).required(),
            }),
        )
        .min(1)
        .required()
        .messages({
            'array.min': ERROR_MESSAGES.ORDER_MUST_HAVE_AT_LEAST_ONE_ITEM,
            'any.required': ERROR_MESSAGES.ORDER_ITEMS_REQUIRED,
        }),

    shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(2).required(),
        phoneNumber: Joi.string().trim().required(),
        address: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        district: Joi.string().trim().required(),
        postalCode: Joi.string().trim().optional(),
        notes: Joi.string().trim().max(500).optional(),
    }).required(),

    paymentMethod: Joi.string().valid('cod', 'credit_card', 'bank_transfer', 'momo', 'zalopay').required().messages({
        'any.required': ERROR_MESSAGES.PAYMENT_METHOD_REQUIRED,
        'any.only': ERROR_MESSAGES.INVALID_PAYMENT_METHOD,
    }),

    appliedCoupon: Joi.object({
        code: Joi.string().trim().uppercase().required(),
        discount: Joi.number().min(0).required(),
        discountType: Joi.string().valid('percentage', 'fixed').required(),
    }).optional(),

    notes: Joi.string().trim().max(500).optional(),
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required()
        .messages({
            'any.required': ERROR_MESSAGES.ORDER_STATUS_REQUIRED,
            'any.only': ERROR_MESSAGES.INVALID_ORDER_STATUS,
        }),

    comment: Joi.string().trim().max(500).optional(),

    changedBy: Joi.string().trim().optional(),
});

export const cancelOrderSchema = Joi.object({
    reason: Joi.string().trim().min(5).max(500).required().messages({
        'string.min': ERROR_MESSAGES.CANCELLATION_REASON_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.CANCELLATION_REASON_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.CANCELLATION_REASON_REQUIRED,
    }),

    cancelledBy: Joi.string().trim().optional(),
});

export const refundOrderSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
        'number.positive': ERROR_MESSAGES.REFUND_AMOUNT_MUST_BE_POSITIVE,
        'any.required': ERROR_MESSAGES.REFUND_AMOUNT_REQUIRED,
    }),

    reason: Joi.string().trim().min(5).max(500).required().messages({
        'string.min': ERROR_MESSAGES.REFUND_REASON_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.REFUND_REASON_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.REFUND_REASON_REQUIRED,
    }),

    method: Joi.string().valid('original_payment', 'bank_transfer', 'cash').default('original_payment').messages({
        'any.only': ERROR_MESSAGES.INVALID_REFUND_METHOD,
    }),

    processedBy: Joi.string().trim().required(),
});

export const trackingInfoSchema = Joi.object({
    shippingCompany: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': ERROR_MESSAGES.SHIPPING_COMPANY_NAME_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.SHIPPING_COMPANY_NAME_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.SHIPPING_COMPANY_REQUIRED,
    }),

    trackingNumber: Joi.string().trim().min(5).max(100).required().messages({
        'string.min': ERROR_MESSAGES.TRACKING_NUMBER_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.TRACKING_NUMBER_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.TRACKING_NUMBER_REQUIRED,
    }),

    estimatedDelivery: Joi.date().greater('now').optional().messages({
        'date.greater': ERROR_MESSAGES.ESTIMATED_DELIVERY_DATE_MUST_BE_IN_FUTURE,
    }),
});

export const internalNoteSchema = Joi.object({
    note: Joi.string().trim().min(5).max(1000).required().messages({
        'string.min': ERROR_MESSAGES.NOTE_MIN_LENGTH,
        'string.max': ERROR_MESSAGES.NOTE_MAX_LENGTH,
        'any.required': ERROR_MESSAGES.NOTE_REQUIRED,
    }),

    addedBy: Joi.string().trim().required(),
});

export const orderQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'orderStatus', 'totalPrice', 'orderNumber').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
        .optional(),
    paymentMethod: Joi.string().valid('cod', 'credit_card', 'bank_transfer', 'momo', 'zalopay').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    userId: Joi.string().trim().optional(),
    search: Joi.string().trim().min(2).optional(),
});

export const validateCreateOrder = (order) => {
    return createOrderSchema.validate(order);
};

export const validateUpdateOrderStatus = (statusUpdate) => {
    return updateOrderStatusSchema.validate(statusUpdate);
};

export const validateCancelOrder = (cancelData) => {
    return cancelOrderSchema.validate(cancelData);
};

export const validateRefundOrder = (refundData) => {
    return refundOrderSchema.validate(refundData);
};

export const validateTrackingInfo = (trackingData) => {
    return trackingInfoSchema.validate(trackingData);
};

export const validateInternalNote = (noteData) => {
    return internalNoteSchema.validate(noteData);
};

export const validateOrderQuery = (query) => {
    return orderQuerySchema.validate(query);
};
