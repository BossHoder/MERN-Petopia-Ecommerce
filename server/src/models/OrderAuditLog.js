import mongoose from 'mongoose';

const orderAuditLogSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true,
        },
        orderNumber: {
            type: String,
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            enum: ['status_change', 'payment_status_change', 'order_created', 'order_updated'],
        },
        field: {
            type: String,
            required: true,
            enum: ['orderStatus', 'isPaid', 'paidAt', 'deliveredAt', 'general'],
        },
        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        changedByRole: {
            type: String,
            required: true,
            enum: ['admin', 'user', 'system'],
            default: 'admin',
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
        notes: {
            type: String,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        collection: 'orderauditlogs',
    }
);

// Indexes for better query performance
orderAuditLogSchema.index({ orderId: 1, createdAt: -1 });
orderAuditLogSchema.index({ orderNumber: 1, createdAt: -1 });
orderAuditLogSchema.index({ action: 1, createdAt: -1 });
orderAuditLogSchema.index({ changedBy: 1, createdAt: -1 });

// Static method to log order changes
orderAuditLogSchema.statics.logChange = async function(logData) {
    try {
        const auditLog = new this(logData);
        await auditLog.save();
        return auditLog;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to prevent breaking the main operation
        return null;
    }
};

// Static method to get order audit history
orderAuditLogSchema.statics.getOrderHistory = async function(orderId, limit = 50) {
    try {
        return await this.find({ orderId })
            .populate('changedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Failed to get order history:', error);
        return [];
    }
};

// Instance method to format log entry for display
orderAuditLogSchema.methods.getDisplayMessage = function() {
    const actionMessages = {
        status_change: `Order status changed from "${this.oldValue}" to "${this.newValue}"`,
        payment_status_change: `Payment status changed from "${this.oldValue ? 'Paid' : 'Unpaid'}" to "${this.newValue ? 'Paid' : 'Unpaid'}"`,
        order_created: 'Order created',
        order_updated: 'Order updated',
    };

    return actionMessages[this.action] || `${this.field} changed`;
};

// Virtual for formatted timestamp
orderAuditLogSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleString();
});

// Ensure virtual fields are serialized
orderAuditLogSchema.set('toJSON', { virtuals: true });
orderAuditLogSchema.set('toObject', { virtuals: true });

const OrderAuditLog = mongoose.model('OrderAuditLog', orderAuditLogSchema);

export default OrderAuditLog;
