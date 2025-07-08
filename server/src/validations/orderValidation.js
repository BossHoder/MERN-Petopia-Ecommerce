import Joi from 'joi';

/**
 * Order validation schemas
 */

export const createOrderSchema = Joi.object({
    username: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'User ID is required'
        }),

    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                variantId: Joi.string().optional(),
                productName: Joi.string().required(),
                image: Joi.string().required(),
                price: Joi.number().positive().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'Order must have at least one item',
            'any.required': 'Order items are required'
        }),

    shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(2).required(),
        phoneNumber: Joi.string().trim().required(),
        address: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        district: Joi.string().trim().required(),
        postalCode: Joi.string().trim().optional(),
        notes: Joi.string().trim().max(500).optional()
    }).required(),

    paymentMethod: Joi.string()
        .valid('cod', 'credit_card', 'bank_transfer', 'momo', 'zalopay')
        .required()
        .messages({
            'any.required': 'Payment method is required',
            'any.only': 'Invalid payment method'
        }),

    appliedCoupon: Joi.object({
        code: Joi.string().trim().uppercase().required(),
        discount: Joi.number().min(0).required(),
        discountType: Joi.string().valid('percentage', 'fixed').required()
    }).optional(),

    notes: Joi.string().trim().max(500).optional()
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required()
        .messages({
            'any.required': 'Order status is required',
            'any.only': 'Invalid order status'
        }),

    comment: Joi.string().trim().max(500).optional(),

    changedBy: Joi.string().trim().optional()
});

export const cancelOrderSchema = Joi.object({
    reason: Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.min': 'Cancellation reason must be at least 5 characters',
            'string.max': 'Cancellation reason cannot exceed 500 characters',
            'any.required': 'Cancellation reason is required'
        }),

    cancelledBy: Joi.string().trim().optional()
});

export const refundOrderSchema = Joi.object({
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'Refund amount must be positive',
            'any.required': 'Refund amount is required'
        }),

    reason: Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.min': 'Refund reason must be at least 5 characters',
            'string.max': 'Refund reason cannot exceed 500 characters',
            'any.required': 'Refund reason is required'
        }),

    method: Joi.string()
        .valid('original_payment', 'bank_transfer', 'cash')
        .default('original_payment')
        .messages({
            'any.only': 'Invalid refund method'
        }),

    processedBy: Joi.string().trim().required()
});

export const trackingInfoSchema = Joi.object({
    shippingCompany: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Shipping company name must be at least 2 characters',
            'string.max': 'Shipping company name cannot exceed 100 characters',
            'any.required': 'Shipping company is required'
        }),

    trackingNumber: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .required()
        .messages({
            'string.min': 'Tracking number must be at least 5 characters',
            'string.max': 'Tracking number cannot exceed 100 characters',
            'any.required': 'Tracking number is required'
        }),

    estimatedDelivery: Joi.date()
        .greater('now')
        .optional()
        .messages({
            'date.greater': 'Estimated delivery date must be in the future'
        })
});

export const internalNoteSchema = Joi.object({
    note: Joi.string()
        .trim()
        .min(5)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Note must be at least 5 characters',
            'string.max': 'Note cannot exceed 1000 characters',
            'any.required': 'Note is required'
        }),

    addedBy: Joi.string().trim().required()
});

export const orderQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'status', 'pricing.total', 'orderNumber').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').optional(),
    paymentMethod: Joi.string().valid('cod', 'credit_card', 'bank_transfer', 'momo', 'zalopay').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    userId: Joi.string().trim().optional(),
    search: Joi.string().trim().min(2).optional()
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
