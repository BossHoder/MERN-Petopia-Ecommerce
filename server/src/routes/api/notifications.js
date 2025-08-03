// ===========================================
// NOTIFICATION ROUTES
// ===========================================
// RESTful API routes for notification management

import { Router } from 'express';
import requireJwtAuth from '../../middleware/requireJwtAuth.js';
import requireAdmin from '../../middleware/requireAdmin.js';
import notificationController from '../../controllers/notificationController.js';

const router = Router();

// ===========================================
// USER NOTIFICATION ROUTES (Protected)
// ===========================================

// All user routes require authentication
router.use(requireJwtAuth);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination and filtering
 * @query   page, limit, unreadOnly, type, priority
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/summary
 * @desc    Get notification summary (unread count + recent notifications)
 * @access  Private
 */
router.get('/summary', notificationController.getNotificationSummary);

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for current user
 * @access  Private
 */
router.post('/mark-all-read', notificationController.markAllNotificationsAsRead);

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark specific notification as read
 * @access  Private
 */
router.post('/:id/read', notificationController.markNotificationAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete specific notification
 * @access  Private
 */
router.delete('/:id', notificationController.deleteNotification);

// ===========================================
// ADMIN NOTIFICATION ROUTES (Admin Only)
// ===========================================

/**
 * @route   GET /api/notifications/admin/all
 * @desc    Get all notifications with admin privileges
 * @query   page, limit, type, priority
 * @access  Private/Admin
 */
router.get('/admin/all', requireAdmin, notificationController.getAllNotifications);

/**
 * @route   POST /api/notifications/admin/broadcast
 * @desc    Broadcast notification to multiple users
 * @body    { userIds, type, title, message, priority, relatedData, channels }
 * @access  Private/Admin
 */
router.post('/admin/broadcast', requireAdmin, notificationController.broadcastNotification);

/**
 * @route   GET /api/notifications/admin/stats
 * @desc    Get notification statistics for admin dashboard
 * @access  Private/Admin
 */
router.get('/admin/stats', requireAdmin, notificationController.getNotificationStats);

export default router;
