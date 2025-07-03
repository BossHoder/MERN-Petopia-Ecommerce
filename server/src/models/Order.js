import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
            trim: true
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
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'failed']
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
orderSchema.index({ paymentResult: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });
orderSchema.virtual('finalAmount').get(function() {
    return this.totalAmount + (this.finalAmount >= 200000 ? 0 : 20000);
});

const Order = mongoose.model('Order', orderSchema);
export default Order;