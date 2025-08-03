// ===========================================
// NOTIFICATION ACTIONS
// ===========================================
// Redux actions for notification management

import API from '../../services/api';
import {
    GET_NOTIFICATIONS_REQUEST,
    GET_NOTIFICATIONS_SUCCESS,
    GET_NOTIFICATIONS_FAIL,
    GET_NOTIFICATION_SUMMARY_REQUEST,
    GET_NOTIFICATION_SUMMARY_SUCCESS,
    GET_NOTIFICATION_SUMMARY_FAIL,
    MARK_NOTIFICATION_READ_REQUEST,
    MARK_NOTIFICATION_READ_SUCCESS,
    MARK_NOTIFICATION_READ_FAIL,
    MARK_ALL_NOTIFICATIONS_READ_REQUEST,
    MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
    MARK_ALL_NOTIFICATIONS_READ_FAIL,
    DELETE_NOTIFICATION_REQUEST,
    DELETE_NOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_FAIL,
    ADMIN_NOTIFICATIONS_REQUEST,
    ADMIN_NOTIFICATIONS_SUCCESS,
    ADMIN_NOTIFICATIONS_FAIL,
    ADMIN_NOTIFICATION_BROADCAST_REQUEST,
    ADMIN_NOTIFICATION_BROADCAST_SUCCESS,
    ADMIN_NOTIFICATION_BROADCAST_FAIL,
    ADMIN_NOTIFICATION_STATS_REQUEST,
    ADMIN_NOTIFICATION_STATS_SUCCESS,
    ADMIN_NOTIFICATION_STATS_FAIL,
    NOTIFICATION_RECEIVED,
    CLEAR_NOTIFICATION_ERRORS,
} from '../types';
import { toast } from 'react-toastify';

// ===========================================
// USER NOTIFICATION ACTIONS
// ===========================================

/**
 * Get user notifications with pagination and filtering
 */
export const getUserNotifications =
    (page = 1, limit = 20, unreadOnly = false, type = null) =>
    async (dispatch) => {
        try {
            dispatch({ type: GET_NOTIFICATIONS_REQUEST });

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                unreadOnly: unreadOnly.toString(),
            });

            if (type) {
                params.append('type', type);
            }

            const response = await API.get(`/api/notifications?${params}`);

            dispatch({
                type: GET_NOTIFICATIONS_SUCCESS,
                payload: response.data.data,
            });

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.error?.message || 'Failed to fetch notifications';

            dispatch({
                type: GET_NOTIFICATIONS_FAIL,
                payload: errorMessage,
            });

            throw error;
        }
    };

/**
 * Get notification summary (unread count + recent notifications)
 */
export const getNotificationSummary = () => async (dispatch) => {
    try {
        dispatch({ type: GET_NOTIFICATION_SUMMARY_REQUEST });

        const response = await API.get('/api/notifications/summary');

        dispatch({
            type: GET_NOTIFICATION_SUMMARY_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to fetch notification summary';

        dispatch({
            type: GET_NOTIFICATION_SUMMARY_FAIL,
            payload: errorMessage,
        });

        throw error;
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
    try {
        dispatch({
            type: MARK_NOTIFICATION_READ_REQUEST,
            payload: { notificationId },
        });

        const response = await API.post(`/api/notifications/${notificationId}/read`);

        dispatch({
            type: MARK_NOTIFICATION_READ_SUCCESS,
            payload: { notificationId },
        });

        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to mark notification as read';

        dispatch({
            type: MARK_NOTIFICATION_READ_FAIL,
            payload: errorMessage,
        });

        throw error;
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = () => async (dispatch) => {
    try {
        dispatch({ type: MARK_ALL_NOTIFICATIONS_READ_REQUEST });

        const response = await API.post('/api/notifications/mark-all-read');

        dispatch({
            type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
        });

        toast.success('All notifications marked as read');
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to mark all notifications as read';

        dispatch({
            type: MARK_ALL_NOTIFICATIONS_READ_FAIL,
            payload: errorMessage,
        });

        toast.error(errorMessage);
        throw error;
    }
};

/**
 * Delete notification
 */
export const deleteNotification = (notificationId) => async (dispatch) => {
    try {
        dispatch({
            type: DELETE_NOTIFICATION_REQUEST,
            payload: { notificationId },
        });

        const response = await API.delete(`/api/notifications/${notificationId}`);

        dispatch({
            type: DELETE_NOTIFICATION_SUCCESS,
            payload: { notificationId },
        });

        toast.success('Notification deleted successfully');
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to delete notification';

        dispatch({
            type: DELETE_NOTIFICATION_FAIL,
            payload: errorMessage,
        });

        toast.error(errorMessage);
        throw error;
    }
};

// ===========================================
// ADMIN NOTIFICATION ACTIONS
// ===========================================

/**
 * Get all notifications (admin)
 */
export const getAdminNotifications =
    (page = 1, limit = 20, filters = {}) =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_NOTIFICATIONS_REQUEST });

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (filters.type) params.append('type', filters.type);
            if (filters.priority) params.append('priority', filters.priority);

            const response = await API.get(`/api/notifications/admin/all?${params}`);

            dispatch({
                type: ADMIN_NOTIFICATIONS_SUCCESS,
                payload: response.data.data,
            });

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.error?.message || 'Failed to fetch admin notifications';

            dispatch({
                type: ADMIN_NOTIFICATIONS_FAIL,
                payload: errorMessage,
            });

            throw error;
        }
    };

/**
 * Broadcast notification to multiple users (admin)
 */
export const broadcastNotification = (notificationData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_NOTIFICATION_BROADCAST_REQUEST });

        const response = await API.post('/api/notifications/admin/broadcast', notificationData);

        dispatch({
            type: ADMIN_NOTIFICATION_BROADCAST_SUCCESS,
            payload: response.data.data,
        });

        toast.success(`Notification sent to ${response.data.data.created} users`);
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to broadcast notification';

        dispatch({
            type: ADMIN_NOTIFICATION_BROADCAST_FAIL,
            payload: errorMessage,
        });

        toast.error(errorMessage);
        throw error;
    }
};

/**
 * Get notification statistics (admin)
 */
export const getNotificationStats = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_NOTIFICATION_STATS_REQUEST });

        const response = await API.get('/api/notifications/admin/stats');

        dispatch({
            type: ADMIN_NOTIFICATION_STATS_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.error?.message || 'Failed to fetch notification stats';

        dispatch({
            type: ADMIN_NOTIFICATION_STATS_FAIL,
            payload: errorMessage,
        });

        throw error;
    }
};

// ===========================================
// REAL-TIME NOTIFICATION ACTIONS
// ===========================================

/**
 * Handle incoming real-time notification
 */
export const receiveNotification = (notification) => (dispatch) => {
    dispatch({
        type: NOTIFICATION_RECEIVED,
        payload: notification,
    });

    // Show toast notification for real-time notifications
    toast.info(notification.title, {
        autoClose: 5000,
    });
};

/**
 * Clear notification errors
 */
export const clearNotificationErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_NOTIFICATION_ERRORS });
};
