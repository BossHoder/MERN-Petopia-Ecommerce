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
    // Product name (saved at time of order)
    productName: {
        type: String,
        required: true,
        trim: true
    },
    // Product image (saved at time of order)
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
        address: {
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
    // Tax amount
    taxPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    // Discount amount (from coupons, promotions)
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Final total amount
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
        email_address: { type: String }
    },
    // Whether payment has been received
    isPaid: {
        type: Boolean,
        default: false
    },
    // When payment was received
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
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Whether order has been delivered
    isDelivered: {
        type: Boolean,
        default: false
    },
    // When order was delivered
    deliveredAt: {
        type: Date
    },
    // Tracking number from shipping company
    trackingNumber: {
        type: String,
        sparse: true
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
}, {
    timestamps: true // Auto add createdAt and updatedAt
})

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
orderSchema.index({ username: 1, status: 1 }); // Find user's orders by status
orderSchema.index({ status: 1 }); // Filter by status
orderSchema.index({ paymentMethod: 1 }); // Filter by payment method
orderSchema.index({ orderNumber: 1 }, { unique: true }); // Unique order lookup
orderSchema.index({ createdAt: -1 }); // Sort by newest first
orderSchema.index({ 'orderItems.productId': 1 }); // Find orders containing specific product

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
        // Define valid status transitions
        const validTransitions = {
            'pending': ['processing', 'cancelled'],
            'processing': ['completed', 'cancelled'],
            'completed': [], // Cannot change from completed
            'cancelled': [] // Cannot change from cancelled
        };

        const currentStatus = this.status;
        const previousStatus = this._original?.status;

        // Check if status transition is valid
        if (previousStatus && !validTransitions[previousStatus]?.includes(currentStatus)) {
            return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
        }
        
        // Auto-update delivery status when completed
        if (currentStatus === 'completed' && !this.deliveredAt) {
            this.isDelivered = true;
            this.deliveredAt = new Date();
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
        ...this.paymentResult.toObject(),
        ...paymentResult
    };
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

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Order = mongoose.model('Order', orderSchema);
export default Order;