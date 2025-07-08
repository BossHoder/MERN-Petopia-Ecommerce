// ===========================================
// NOTIFICATION HELPER FUNCTIONS
// ===========================================
// This file contains utility functions for notification operations

import Notification from '../models/Notification.js';

// Create notification for user
export const createNotification = async (userId, type, title, message, relatedData = {}, channels = {}) => {
    try {
        const notification = await Notification.createForUser(
            userId,
            type,
            title,
            message,
            relatedData,
            channels
        );

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Create bulk notifications for multiple users
export const createBulkNotifications = async (userIds, type, title, message, relatedData = {}, channels = {}) => {
    try {
        const notifications = [];
        const failed = [];

        for (const userId of userIds) {
            try {
                const notification = await Notification.createForUser(
                    userId,
                    type,
                    title,
                    message,
                    relatedData,
                    channels
                );
                notifications.push(notification);
            } catch (error) {
                failed.push({
                    userId,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            created: notifications.length,
            failed: failed.length,
            details: {
                notifications,
                failed
            }
        };
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Order status notification templates
export const createOrderStatusNotification = async (userId, orderId, status, orderNumber = null) => {
    const templates = {
        confirmed: {
            title: 'Order Confirmed',
            message: `Your order ${orderNumber || orderId} has been confirmed and is being processed.`,
            priority: 'high',
            channels: { inApp: true, email: true, sms: true }
        },
        processing: {
            title: 'Order Processing',
            message: `Your order ${orderNumber || orderId} is being prepared for shipment.`,
            priority: 'medium',
            channels: { inApp: true, email: true, sms: false }
        },
        shipped: {
            title: 'Order Shipped',
            message: `Great news! Your order ${orderNumber || orderId} has been shipped and is on its way.`,
            priority: 'high',
            channels: { inApp: true, email: true, sms: true }
        },
        delivered: {
            title: 'Order Delivered',
            message: `Your order ${orderNumber || orderId} has been successfully delivered. Thank you for shopping with us!`,
            priority: 'medium',
            channels: { inApp: true, email: true, sms: false }
        },
        cancelled: {
            title: 'Order Cancelled',
            message: `Your order ${orderNumber || orderId} has been cancelled. If you have any questions, please contact support.`,
            priority: 'high',
            channels: { inApp: true, email: true, sms: false }
        }
    };

    const template = templates[status];
    if (!template) {
        throw new Error(`Unknown order status: ${status}`);
    }

    return await createNotification(
        userId,
        'order_status',
        template.title,
        template.message,
        {
            orderId,
            orderNumber,
            status,
            actionUrl: `/orders/${orderId}`
        },
        template.channels
    );
};

// Payment notification templates
export const createPaymentNotification = async (userId, orderId, paymentStatus, amount = null) => {
    const templates = {
        success: {
            title: 'Payment Successful',
            message: `Your payment${amount ? ` of ${amount.toLocaleString()}đ` : ''} has been processed successfully.`,
            priority: 'high',
            channels: { inApp: true, email: true, sms: false }
        },
        failed: {
            title: 'Payment Failed',
            message: `We couldn't process your payment${amount ? ` of ${amount.toLocaleString()}đ` : ''}. Please try again.`,
            priority: 'high',
            channels: { inApp: true, email: true, sms: false }
        },
        refunded: {
            title: 'Payment Refunded',
            message: `Your refund${amount ? ` of ${amount.toLocaleString()}đ` : ''} has been processed and will appear in your account within 5-7 business days.`,
            priority: 'medium',
            channels: { inApp: true, email: true, sms: false }
        }
    };

    const template = templates[paymentStatus];
    if (!template) {
        throw new Error(`Unknown payment status: ${paymentStatus}`);
    }

    return await createNotification(
        userId,
        paymentStatus === 'success' ? 'payment_success' : 'payment_failed',
        template.title,
        template.message,
        {
            orderId,
            paymentStatus,
            amount,
            actionUrl: `/orders/${orderId}`
        },
        template.channels
    );
};

// Product back in stock notification
export const createStockNotification = async (userId, productId, productName) => {
    return await createNotification(
        userId,
        'product_back_in_stock',
        'Product Back in Stock!',
        `Great news! ${productName} is back in stock. Order now before it runs out again.`,
        {
            productId,
            productName,
            actionUrl: `/products/${productId}`
        },
        { inApp: true, email: true, sms: false }
    );
};

// Promotional notification
export const createPromotionalNotification = async (userId, title, message, actionUrl = null, couponCode = null) => {
    return await createNotification(
        userId,
        'promotion',
        title,
        message,
        {
            couponCode,
            actionUrl: actionUrl || '/products'
        },
        { inApp: true, email: true, sms: false }
    );
};

// Welcome notification for new users
export const createWelcomeNotification = async (userId, userName = null) => {
    const message = userName 
        ? `Welcome to Petopia, ${userName}! Thank you for joining our pet-loving community.`
        : 'Welcome to Petopia! Thank you for joining our pet-loving community.';

    return await createNotification(
        userId,
        'welcome',
        'Welcome to Petopia!',
        message,
        {
            actionUrl: '/products'
        },
        { inApp: true, email: true, sms: false }
    );
};

// Review request notification
export const createReviewRequestNotification = async (userId, orderId, productNames = []) => {
    const productText = productNames.length > 0 
        ? `for ${productNames.join(', ')}`
        : 'for your recent purchase';

    return await createNotification(
        userId,
        'review_request',
        'How was your experience?',
        `We'd love to hear about your experience ${productText}. Your review helps other pet owners make informed decisions.`,
        {
            orderId,
            actionUrl: `/orders/${orderId}/review`
        },
        { inApp: true, email: true, sms: false }
    );
};

// Get notification statistics
export const getNotificationStats = async (userId = null) => {
    try {
        const query = userId ? { recipient: userId } : {};
        
        const [total, unread, byType, byPriority] = await Promise.all([
            Notification.countDocuments(query),
            Notification.countDocuments({ ...query, isRead: false }),
            Notification.aggregate([
                { $match: query },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]),
            Notification.aggregate([
                { $match: query },
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ])
        ]);

        return {
            total,
            unread,
            byType: byType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byPriority: byPriority.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };
    } catch (error) {
        console.error('Error getting notification stats:', error);
        return null;
    }
};

// Clean up old notifications
export const cleanupOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
        
        const result = await Notification.deleteMany({
            createdAt: { $lt: cutoffDate },
            isRead: true
        });

        return {
            success: true,
            deletedCount: result.deletedCount
        };
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
