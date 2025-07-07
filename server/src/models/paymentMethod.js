import mongoose from 'mongoose';

// ===========================================
// PAYMENT METHOD SCHEMA
// ===========================================
// This schema defines available payment methods for the store
const paymentMethodSchema = new mongoose.Schema({
    // Payment method name (displayed to customers)
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Description of this payment method
    description: {
        type: String,
        required: true,
        trim: true
    },
    // Type of payment method
    type: {
        type: String,
        required: true,
        enum: ['momo', 'zalopay', 'bank_transfer', 'cod'], // Available payment types
        default: 'cod' // Cash on delivery as default
    },
    // Whether this payment method is currently available
    isActive: {
        type: Boolean,
        default: true
    },
})

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
paymentMethodSchema.index({ name: 1 }, { unique: true }); // Unique name lookup
paymentMethodSchema.index({ type: 1 }); // Find by type quickly
paymentMethodSchema.index({ isActive: 1 }); // Filter active methods

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;