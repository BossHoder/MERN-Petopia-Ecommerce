// ===========================================
// NOTIFICATION DATA TRANSFER OBJECTS
// ===========================================
// This file contains DTOs for transforming notification data

// Basic notification info for user
export const notificationDto = (notification) => {
    return {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedData: notification.relatedData,
        isRead: notification.isRead,
        readAt: notification.readAt,
        priority: notification.priority,
        createdAt: notification.createdAt,
        expiresAt: notification.expiresAt,
    };
};

// Notification list for user
export const notificationListDto = (notifications) => {
    return notifications.map((notification) => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedData: notification.relatedData,
        isRead: notification.isRead,
        readAt: notification.readAt,
        priority: notification.priority,
        createdAt: notification.createdAt,
    }));
};

// Notification summary for user
export const notificationSummaryDto = (unreadCount, recentNotifications) => {
    return {
        unreadCount,
        recentNotifications: notificationListDto(recentNotifications),
    };
};

// Admin notification details
export const notificationAdminDto = (notification) => {
    return {
        id: notification._id,
        recipient: notification.recipient,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedData: notification.relatedData,
        isRead: notification.isRead,
        readAt: notification.readAt,
        priority: notification.priority,
        channels: notification.channels,
        deliveryStatus: notification.deliveryStatus,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        expiresAt: notification.expiresAt,
    };
};

// Create notification DTO
export const createNotificationDto = (data) => {
    return {
        recipient: data.recipient,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedData: data.relatedData || {},
        priority: data.priority || 'medium',
        channels: {
            inApp: true,
            email: false,
            sms: false,
            ...data.channels,
        },
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
};

// Notification stats for admin
export const notificationStatsDto = (stats) => {
    return {
        total: stats.total,
        unread: stats.unread,
        byType: stats.byType,
        byPriority: stats.byPriority,
        deliveryStats: stats.deliveryStats,
    };
};

// Bulk notification result
export const bulkNotificationResultDto = (results) => {
    return {
        success: results.success,
        failed: results.failed,
        total: results.total,
        details: results.details,
    };
};
