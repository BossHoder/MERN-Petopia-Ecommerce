import mongoose from 'mongoose';

// ===========================================
// ORDER ITEM SCHEMA
// ===========================================
// This schema defines each product in an order
const orderItemSchema = new mongoose.Schema({
    // Reference to the actual product
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        // Check if product actually exists
        validate: {
            validator: async function (v) {
                const Product = mongoose.model('Product');
                const product = await Product.findById(v);
                return !!product;
            },
            message: 'Product does not exist'
        }
    },
    // Selected variant (if any)
    variantId: {
        type: String,
        trim: true
    },
    // Product name (saved at time of order)
    productName: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
    },
    // Price at time of order (may be different from current price)
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    // How many of this product were ordered
    quantity: {
        type: Number,
        required: true,
        min: 1,
    }
})

// ===========================================
// MAIN ORDER SCHEMA
// ===========================================
// This schema defines customer orders
const orderSchema = new mongoose.Schema({
    // Unique order number for tracking
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    // Which customer placed this order
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Check if user actually exists
        validate: {
            validator: async function (v) {
                const User = mongoose.model('User');
                const user = await User.findById(v);
                return !!user;
            },
            message: 'User does not exist'
        }
    },
    // List of products in this order
    orderItems: [orderItemSchema],
    
    // ===========================================
    // SHIPPING INFORMATION
    // ===========================================
    shippingAddress: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        },
        ward: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            // Validate phone number format
            validate: {
                validator: function (v) {
                    return /^[0-9]{10,11}$/.test(v);
                },
                message: 'Phone number must be 10-11 digits'
            }
        }
    },
    
    // ===========================================
    // PRICING BREAKDOWN
    // ===========================================
    // Cost of all items (before shipping, tax, discount)
    itemsPrice: {
        type: Number,
        required: true,
        min: 0
    },
    // Shipping fee
    shippingPrice: {
        type: Number,
        required: true,
        min: 0,
        default: function() {
            return this.calculateShippingFee();
        }
    },
    taxPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    // Discount from coupon
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Applied coupon details
    appliedCoupon: {
        code: {
            type: String,
            trim: true
        },
        discount: {
            type: Number,
            min: 0
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0.0
    },
    
    // ===========================================
    // PAYMENT INFORMATION
    // ===========================================
    // How customer wants to pay
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'momo', 'zalopay', 'cod'],
        default: 'cod'
    },
    // Payment gateway response (for online payments)
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
        transaction_id: { type: String }
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    
    // ===========================================
    // ORDER STATUS AND TRACKING
    // ===========================================
    // Current order status
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    // Status history for tracking
    statusHistory: [{
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            trim: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    // Tracking number from shipping company
    trackingNumber: {
        type: String,
        sparse: true
    },
    // Shipping company
    shippingCompany: {
        type: String,
        enum: ['ghn', 'ghtk', 'vnpost', 'self'],
        default: 'ghn'
    },
    // Expected delivery date
    estimatedDelivery: {
        type: Date
    },
    
    // ===========================================
    // ADDITIONAL INFORMATION
    // ===========================================
    // Special instructions from customer
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Customer service notes (internal)
    internalNotes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    // Cancellation reason
    cancellationReason: {
        type: String,
        trim: true
    },
    // Refund information
    refundInfo: {
        amount: {
            type: Number,
            min: 0
        },
        reason: {
            type: String,
            trim: true
        },
        processedAt: {
            type: Date
        },
        refundMethod: {
            type: String,
            enum: ['bank_transfer', 'momo', 'zalopay', 'cash']
        }
    }
}, {
    timestamps: true
})

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
orderSchema.index({ username: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'orderItems.productId': 1 });
orderSchema.index({ 'appliedCoupon.code': 1 });

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
// Calculate final amount including shipping (free shipping over 200k)
orderSchema.virtual('finalAmount').get(function () {
    return this.totalAmount + (this.totalAmount >= 200000 ? 0 : 20000);
});

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Auto-generate order number if not provided
orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Validate order has items and valid total
orderSchema.pre('save', function (next) {
    if (!this.orderItems || this.orderItems.length === 0) {
        return next(new Error('Order must have at least one item'));
    }

    if (this.totalAmount <= 0) {
        return next(new Error('Total amount must be greater than 0'));
    }

    next();
});

// Handle status transitions and auto-update timestamps
orderSchema.pre('save', function (next) {
    if (this.isModified('status') && !this.isNew) {
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'cancelled'],
            'delivered': ['refunded'],
            'cancelled': ['refunded'],
            'refunded': []
        };

        const currentStatus = this.status;
        const previousStatus = this._original?.status;

        // Check if status transition is valid
        if (previousStatus && !validTransitions[previousStatus]?.includes(currentStatus)) {
            return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
        }
        
        // Add to status history
        this.statusHistory.push({
            status: currentStatus,
            timestamp: new Date(),
            note: `Status changed from ${previousStatus} to ${currentStatus}`
        });
        
        // Auto-update delivery status when delivered
        if (currentStatus === 'delivered' && !this.deliveredAt) {
            this.isDelivered = true;
            this.deliveredAt = new Date();
        }
        
        // Auto-update payment status for COD when delivered
        if (currentStatus === 'delivered' && this.paymentMethod === 'cod' && !this.isPaid) {
            this.isPaid = true;
            this.paidAt = new Date();
        }
    }
    next();
});

// ===========================================
// INSTANCE METHODS (actions on individual order)
// ===========================================
// Calculate shipping fee (free for orders over 200k VND)
orderSchema.methods.calculateShippingFee = function () {
    return this.totalAmount >= 200000 ? 0 : 20000;
};

// Get final amount including shipping
orderSchema.methods.getFinalAmount = function () {
    return this.totalAmount + this.calculateShippingFee();
};

// Calculate all totals
orderSchema.methods.calculateTotal = function() {
    this.itemsPrice = this.orderItems.reduce((acc, item) => 
        acc + (item.price * item.quantity), 0);
    this.shippingPrice = this.calculateShippingFee();
    this.totalAmount = this.itemsPrice + this.shippingPrice + this.taxPrice - this.discount;
    return this.totalAmount;
};

// Mark order as paid
orderSchema.methods.markAsPaid = function(paymentResult = {}) {
    this.isPaid = true;
    this.paidAt = new Date();
    this.paymentResult = {
        ...this.paymentResult?.toObject(),
        ...paymentResult
    };
    return this.save();
};

// Update order status with history
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note || `Status updated to ${newStatus}`,
        updatedBy
    });
    return this.save();
};

// ===========================================
// STATIC METHODS (actions on Order model)
// ===========================================
// Find all orders for a specific user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ username: userId }).sort({ createdAt: -1 });
};

// Find orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Find orders by date range
orderSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};

// Get sales statistics
orderSchema.statics.getSalesStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $in: ['delivered', 'shipped', 'processing'] }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$totalAmount' }
            }
        }
    ]);
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Order = mongoose.model('Order', orderSchema);
export default Order;