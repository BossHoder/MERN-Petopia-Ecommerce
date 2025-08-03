// ===========================================
// NOTIFICATION CONTROLLER
// ===========================================
// This controller handles notification-related HTTP requests

import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse, errorResponse, validationErrorResponse } from '../helpers/responseHelper.js';
import notificationService from '../services/notificationService.js';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';
import User from '../models/User.js';
import Joi from 'joi';

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const notificationQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    unreadOnly: Joi.boolean().default(false),
    type: Joi.string().valid(
        'order_status',
        'payment_success',
        'payment_failed',
        'product_back_in_stock',
        'new_product',
        'promotion',
        'welcome',
        'review_request',
        'system',
    ),
    priority: Joi.string().valid('low', 'medium', 'high'),
});

const broadcastNotificationSchema = Joi.object({
    // Either provide specific userIds or use targetAudience
    userIds: Joi.array().items(Joi.string().required()).min(1).optional(),
    targetAudience: Joi.string().valid('all', 'active_users', 'specific_users').optional(),
    type: Joi.string().required(),
    title: Joi.string().required().max(100),
    message: Joi.string().required().max(500),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    relatedData: Joi.object().default({}),
    channels: Joi.array().items(Joi.string().valid('app', 'email', 'sms')).default(['app']),
    expiresAt: Joi.date().optional(),
}).or('userIds', 'targetAudience'); // At least one of these must be provided

// ===========================================
// USER NOTIFICATION ENDPOINTS
// ===========================================

/**
 * @desc    Get user notifications with pagination
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
    try {
        // Validate query parameters
        const { error, value } = notificationQuerySchema.validate(req.query);
        if (error) {
            return validationErrorResponse(res, error.details[0].message);
        }

        const { page, limit, unreadOnly, type, priority } = value;
        const userId = req.user._id;

        console.log('🔔 Getting notifications for user:', userId, 'Query:', value);

        const result = await notificationService.getUserNotifications(userId, page, limit, unreadOnly);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(
            res,
            {
                notifications: result.notifications,
                pagination: result.pagination,
            },
            'Notifications retrieved successfully',
        );
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get notification summary (unread count + recent notifications)
 * @route   GET /api/notifications/summary
 * @access  Private
 */
const getNotificationSummary = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await notificationService.getUserNotificationSummary(userId);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.summary, 'Notification summary retrieved successfully');
    } catch (error) {
        console.error('Error getting notification summary:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Mark notification as read
 * @route   POST /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        if (!notificationId) {
            return validationErrorResponse(res, 'Notification ID is required');
        }

        const result = await notificationService.markAsRead(notificationId, userId);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, {}, result.message);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/notifications/mark-all-read
 * @access  Private
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await notificationService.markAllAsRead(userId);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, {}, result.message);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        if (!notificationId) {
            return validationErrorResponse(res, 'Notification ID is required');
        }

        const result = await notificationService.deleteNotification(notificationId, userId);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, {}, result.message);
    } catch (error) {
        console.error('Error deleting notification:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

// ===========================================
// ADMIN NOTIFICATION ENDPOINTS
// ===========================================

/**
 * @desc    Get all notifications (admin)
 * @route   GET /api/notifications/admin/all
 * @access  Private/Admin
 */
const getAllNotifications = asyncHandler(async (req, res) => {
    try {
        const { error, value } = notificationQuerySchema.validate(req.query);
        if (error) {
            return validationErrorResponse(res, error.details[0].message);
        }

        const { page, limit, type, priority } = value;
        const filters = { type, priority };

        const result = await notificationService.getAllNotifications(page, limit, filters);

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(
            res,
            {
                notifications: result.notifications,
                pagination: result.pagination,
            },
            'All notifications retrieved successfully',
        );
    } catch (error) {
        console.error('Error getting all notifications:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Broadcast notification to multiple users
 * @route   POST /api/notifications/admin/broadcast
 * @access  Private/Admin
 */
const broadcastNotification = asyncHandler(async (req, res) => {
    try {
        console.log('📨 Received broadcast request:', {
            body: req.body,
            headers: req.headers['content-type'],
            user: req.user ? { id: req.user._id, role: req.user.role } : 'No user',
        });

        const { error, value } = broadcastNotificationSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            console.log('📋 Validation schema expected:', broadcastNotificationSchema.describe());
            return validationErrorResponse(res, error.details[0].message);
        }

        console.log('✅ Validation passed:', value);

        const { userIds, targetAudience, type, title, message, priority, relatedData, channels, expiresAt } = value;

        let finalUserIds = userIds;

        // Handle targetAudience to get userIds
        if (targetAudience && !userIds) {
            let users = [];

            switch (targetAudience) {
                case 'all':
                    users = await User.find({}, '_id');
                    break;
                case 'active_users':
                    // Users who logged in within last 30 days
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    users = await User.find(
                        {
                            lastLoginAt: { $gte: thirtyDaysAgo },
                        },
                        '_id',
                    );
                    break;
                case 'specific_users':
                    return validationErrorResponse(res, 'specific_users requires userIds array');
                default:
                    return validationErrorResponse(res, 'Invalid targetAudience');
            }

            finalUserIds = users.map((user) => user._id.toString());
        }

        if (!finalUserIds || finalUserIds.length === 0) {
            return validationErrorResponse(res, 'No users found to send notification');
        }

        console.log('📡 Broadcasting notification to', finalUserIds.length, 'users');

        const result = await notificationService.sendBulkNotifications(
            finalUserIds,
            type,
            title,
            message,
            relatedData,
            { inApp: channels.includes('app'), email: channels.includes('email'), sms: channels.includes('sms') },
            priority,
            expiresAt,
        );

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(
            res,
            {
                created: result.created,
                failed: result.failed,
                recipientCount: finalUserIds.length,
            },
            'Notification broadcast completed successfully',
        );
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/admin/stats
 * @access  Private/Admin
 */
const getNotificationStats = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.getNotificationStats();

        if (!result.success) {
            return errorResponse(res, result.error, 400);
        }

        return successResponse(res, result.stats, 'Notification statistics retrieved successfully');
    } catch (error) {
        console.error('Error getting notification stats:', error);
        return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
});

// ===========================================
// EXPORTS
// ===========================================

export default {
    getUserNotifications,
    getNotificationSummary,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getAllNotifications,
    broadcastNotification,
    getNotificationStats,
};
