import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    // Legacy variant support (for backward compatibility)
    variantId: {
        type: String,
        required: false, // Optional - only for products with variants
        trim: true,
    },
    variantName: {
        type: String,
        required: false, // Optional - for display purposes
        trim: true,
    },
    // Enhanced variant information from cart
    selectedVariants: {
        variantId: {
            type: String,
            required: false,
            // This stores the combination SKU or unique identifier
        },
        attributes: [
            {
                attributeName: {
                    type: String,
                    required: true,
                    // e.g., "Color", "Size"
                },
                attributeDisplayName: {
                    type: String,
                    required: false,
                    // e.g., "Màu sắc", "Kích cỡ"
                },
                attributeValue: {
                    type: String,
                    required: true,
                    // e.g., "red", "large"
                },
                valueDisplayName: {
                    type: String,
                    required: false,
                    // e.g., "Đỏ", "Lớn"
                },
                colorCode: {
                    type: String,
                    required: false,
                    // For color attributes, hex color code
                },
            },
        ],
        combinationKey: {
            type: String,
            required: false,
            // For quick lookup, e.g., "color:red,size:large"
        },
        images: [
            {
                type: String,
                required: false,
                // Variant-specific images
            },
        ],
    },
});

const ShippingAddressSchema = new Schema({
    address: { type: String, required: true },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phoneNumber: { type: String, required: true },
    fullName: { type: String },
});

const PaymentResultSchema = new Schema({
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
});

const OrderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: false, // Allow null for guest orders
            ref: 'User',
        },
        guestInfo: {
            email: { type: String },
            fullName: { type: String },
            phoneNumber: { type: String },
        },
        isGuestOrder: {
            type: Boolean,
            default: false,
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        orderItems: [OrderItemSchema],
        shippingAddress: ShippingAddressSchema,
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: PaymentResultSchema,
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        // Coupon information
        appliedCoupon: {
            code: {
                type: String,
                uppercase: true,
            },
            discountType: {
                type: String,
                enum: ['percentage', 'fixed'],
            },
            discountValue: {
                type: Number,
            },
            discountAmount: {
                type: Number,
                default: 0,
            },
            couponId: {
                type: Schema.Types.ObjectId,
                ref: 'Coupon',
            },
            appliedAt: {
                type: Date,
                default: Date.now,
            },
        },
        couponDiscount: {
            type: Number,
            default: 0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'delivering', 'delivered', 'cancelled', 'refunded'],
            default: 'pending',
        },
        // Delivery estimation fields
        estimatedDeliveryDate: {
            type: Date,
        },
        estimatedDeliveryRange: {
            start: { type: Date },
            end: { type: Date },
        },
        // Automatic transition tracking
        automaticTransitions: {
            pendingToProcessing: {
                scheduledAt: { type: Date },
                executedAt: { type: Date },
                isAutomatic: { type: Boolean, default: false },
            },
            processingToDelivering: {
                scheduledAt: { type: Date },
                executedAt: { type: Date },
                isAutomatic: { type: Boolean, default: false },
            },
        },
        // Status history for audit trail
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: ['pending', 'processing', 'delivering', 'delivered', 'cancelled', 'refunded'],
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                comment: {
                    type: String,
                    default: '',
                },
                changedBy: {
                    type: String, // 'system' for automatic, user ID for manual
                    default: 'system',
                },
                isAutomatic: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Pre-save hook to generate a unique order number
OrderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
        const lastOrderNumber = lastOrder && lastOrder.orderNumber ? parseInt(lastOrder.orderNumber.slice(1)) : 0;
        const newOrderNumber = lastOrderNumber + 1;
        this.orderNumber = 'D' + String(newOrderNumber).padStart(6, '0');
    }
    next();
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
