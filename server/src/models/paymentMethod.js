import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['momo', 'zalopay', 'bank_transfer', 'cod'],
        default: 'cod'
    },
    isActive: {
        type: Boolean,
        default: true
    },
})

paymentMethodSchema.index({ name: 1 }, { unique: true });
paymentMethodSchema.index({ type: 1 });
paymentMethodSchema.index({ isActive: 1 });
const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;