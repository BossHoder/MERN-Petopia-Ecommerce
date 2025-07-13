import mongoose from 'mongoose';

// ===========================================
// PAYMENT METHOD SCHEMA
// ===========================================
// This schema defines available payment methods for the store
const paymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['momo', 'zalopay', 'bank_transfer', 'cod'],
        default: 'cod',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
paymentMethodSchema.index({ name: 1 }, { unique: true }); // Required for uniqueness
paymentMethodSchema.index({ isActive: 1 }); // Filter active payment methods

// REMOVED FOR SMALL SCALE (can add back when needed):
// paymentMethodSchema.index({ type: 1 }); // Type filtering not frequent with few payment methods

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
