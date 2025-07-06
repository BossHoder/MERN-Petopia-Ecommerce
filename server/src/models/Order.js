import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    orderItems: [
        {
            productId: {
                type: String,
                required: true,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            }
        }
    ],
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
            validate: {
                validator: function(v) {
                    return /^[0-9]{10,11}$/.test(v);
                },
                message: 'Phone number must be 10-11 digits'
            }
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'momo', 'zalopay', 'cod'],
        default: 'cod'
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
})

orderSchema.index({ username: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });
orderSchema.virtual('finalAmount').get(function() {
    return this.totalAmount + (this.totalAmount >= 200000 ? 0 : 20000);
});

orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Add validation for orderItems
orderSchema.pre('save', function(next) {
  if (!this.orderItems || this.orderItems.length === 0) {
    return next(new Error('Order must have at least one item'));
  }
  
  // Validate totalAmount calculation
  if (this.totalAmount <= 0) {
    return next(new Error('Total amount must be greater than 0'));
  }
  
  next();
});

// Add method to calculate shipping fee
orderSchema.methods.calculateShippingFee = function() {
  return this.totalAmount >= 200000 ? 0 : 20000;
};

// Add method to get final amount including shipping
orderSchema.methods.getFinalAmount = function() {
  return this.totalAmount + this.calculateShippingFee();
};

const Order = mongoose.model('Order', orderSchema);
export default Order;