import mongoose from 'mongoose';

// ===========================================
// NOTIFICATION SCHEMA
// ===========================================
// This schema defines notifications for users
const notificationSchema = new mongoose.Schema({
    // Who receives this notification
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Notification type
    type: {
        type: String,
        required: true,
        enum: [
            'order_status',
            'payment_success',
            'payment_failed',
            'product_back_in_stock',
            'new_product',
            'promotion',
            'welcome',
            'review_request',
            'system'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    relatedData: {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        couponCode: String,
        actionUrl: String // URL to redirect when notification is clicked
    },
    // Status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    // Send via channels
    channels: {
        inApp: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        },
        sms: {
            type: Boolean,
            default: false
        }
    },
    deliveryStatus: {
        inApp: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        },
        email: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        },
        sms: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        }
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Notifications expire after 30 days
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    }
}, {
    timestamps: true
});

// ===========================================
// DATABASE INDEXES
// ===========================================
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ===========================================
// INSTANCE METHODS
// ===========================================
// Mark notification as read
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// ===========================================
// STATIC METHODS
// ===========================================
// Create notification for user
notificationSchema.statics.createForUser = function(userId, type, title, message, relatedData = {}, channels = {}) {
    return this.create({
        recipient: userId,
        type,
        title,
        message,
        relatedData,
        channels: {
            inApp: true,
            email: false,
            sms: false,
            ...channels
        }
    });
};

// Get unread notifications for user
notificationSchema.statics.getUnreadForUser = function(userId) {
    return this.find({
        recipient: userId,
        isRead: false
    }).sort({ createdAt: -1 });
};

// Get all notifications for user with pagination
notificationSchema.statics.getForUser = function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Mark all notifications as read for user
notificationSchema.statics.markAllAsReadForUser = function(userId) {
    return this.updateMany(
        { recipient: userId, isRead: false },
        { 
            isRead: true,
            readAt: new Date()
        }
    );
};

// Clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
