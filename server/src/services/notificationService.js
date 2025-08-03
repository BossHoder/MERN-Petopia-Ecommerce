// ===========================================
// NOTIFICATION SERVICE
// ===========================================
// This service handles notification-related business logic

import Notification from '../models/Notification.js';
import {
    createNotification,
    createBulkNotifications,
    createOrderStatusNotification,
    createPaymentNotification,
    createStockNotification,
    createPromotionalNotification,
    createWelcomeNotification,
    createReviewRequestNotification,
    getNotificationStats,
} from '../helpers/notificationHelper.js';
import {
    notificationDto,
    notificationListDto,
    notificationSummaryDto,
    notificationAdminDto,
} from '../dto/notificationDto.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

class NotificationService {
    // Get notifications for user
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        try {
            const skip = (page - 1) * limit;
            const query = { recipient: userId };

            if (unreadOnly) {
                query.isRead = false;
            }

            const [notifications, total] = await Promise.all([
                Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
                Notification.countDocuments(query),
            ]);

            return {
                success: true,
                notifications: notificationListDto(notifications),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get notification summary for user
    async getUserNotificationSummary(userId) {
        try {
            const [unreadCount, recentNotifications] = await Promise.all([
                Notification.countDocuments({ recipient: userId, isRead: false }),
                Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5),
            ]);

            return {
                success: true,
                summary: notificationSummaryDto(unreadCount, recentNotifications),
            };
        } catch (error) {
            console.error('Error getting notification summary:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                _id: notificationId,
                recipient: userId,
            });

            if (!notification) {
                throw new Error(ERROR_MESSAGES.NOTIFICATION_NOT_FOUND);
            }

            await notification.markAsRead();

            return {
                success: true,
                message: 'Notification marked as read',
            };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Mark all notifications as read for user
    async markAllAsRead(userId) {
        try {
            await Notification.markAllAsReadForUser(userId);

            return {
                success: true,
                message: 'All notifications marked as read',
            };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Delete notification
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                _id: notificationId,
                recipient: userId,
            });

            if (!notification) {
                throw new Error(ERROR_MESSAGES.NOTIFICATION_NOT_FOUND);
            }

            await notification.deleteOne();

            return {
                success: true,
                message: 'Notification deleted successfully',
            };
        } catch (error) {
            console.error('Error deleting notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create order status notification
    async createOrderStatusNotification(userId, orderId, status, orderNumber = null) {
        try {
            const result = await createOrderStatusNotification(userId, orderId, status, orderNumber);
            return result;
        } catch (error) {
            console.error('Error creating order status notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create payment notification
    async createPaymentNotification(userId, orderId, paymentStatus, amount = null) {
        try {
            const result = await createPaymentNotification(userId, orderId, paymentStatus, amount);
            return result;
        } catch (error) {
            console.error('Error creating payment notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create stock notification
    async createStockNotification(userId, productId, productName) {
        try {
            const result = await createStockNotification(userId, productId, productName);
            return result;
        } catch (error) {
            console.error('Error creating stock notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create promotional notification
    async createPromotionalNotification(userId, title, message, actionUrl = null, couponCode = null) {
        try {
            const result = await createPromotionalNotification(userId, title, message, actionUrl, couponCode);
            return result;
        } catch (error) {
            console.error('Error creating promotional notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create welcome notification
    async createWelcomeNotification(userId, userName = null) {
        try {
            const result = await createWelcomeNotification(userId, userName);
            return result;
        } catch (error) {
            console.error('Error creating welcome notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Create review request notification
    async createReviewRequestNotification(userId, orderId, productNames = []) {
        try {
            const result = await createReviewRequestNotification(userId, orderId, productNames);
            return result;
        } catch (error) {
            console.error('Error creating review request notification:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Send bulk notifications
    async sendBulkNotifications(
        userIds,
        type,
        title,
        message,
        relatedData = {},
        channels = {},
        priority = 'medium',
        expiresAt = null,
    ) {
        try {
            const result = await createBulkNotifications(
                userIds,
                type,
                title,
                message,
                relatedData,
                channels,
                priority,
                expiresAt,
            );
            return result;
        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get notification statistics (admin)
    async getNotificationStats(userId = null) {
        try {
            const stats = await getNotificationStats(userId);
            return {
                success: true,
                stats,
            };
        } catch (error) {
            console.error('Error getting notification stats:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Get all notifications (admin)
    async getAllNotifications(page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = this.buildNotificationQuery(filters);

            const [notifications, total] = await Promise.all([
                Notification.find(query)
                    .populate('recipient', 'name email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Notification.countDocuments(query),
            ]);

            return {
                success: true,
                notifications: notifications.map((n) => notificationAdminDto(n)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error getting all notifications:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Clean up old notifications
    async cleanupOldNotifications(daysOld = 30) {
        try {
            const result = await Notification.cleanupExpired();
            return {
                success: true,
                message: `Cleaned up ${result.deletedCount} old notifications`,
            };
        } catch (error) {
            console.error('Error cleaning up notifications:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Helper method to build query for filtering notifications
    buildNotificationQuery(filters) {
        const query = {};

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.priority) {
            query.priority = filters.priority;
        }

        if (filters.isRead !== undefined) {
            query.isRead = filters.isRead;
        }

        if (filters.recipient) {
            query.recipient = filters.recipient;
        }

        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { message: { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.dateFrom && filters.dateTo) {
            query.createdAt = {
                $gte: new Date(filters.dateFrom),
                $lte: new Date(filters.dateTo),
            };
        }

        return query;
    }
}

export default new NotificationService();
