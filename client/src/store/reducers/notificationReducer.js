// ===========================================
// NOTIFICATION REDUCER
// ===========================================
// Redux reducer for notification state management

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

// ===========================================
// INITIAL STATE
// ===========================================

const initialState = {
    // User notifications
    notifications: [],
    notificationsPagination: {
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
    },
    summary: {
        unreadCount: 0,
        recentNotifications: [],
    },
    
    // Admin notifications
    adminNotifications: [],
    adminPagination: {
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
    },
    stats: {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {},
        recentActivity: [],
    },
    
    // Loading states
    loading: {
        notifications: false,
        summary: false,
        markingRead: false,
        markingAllRead: false,
        deleting: false,
        adminNotifications: false,
        broadcasting: false,
        stats: false,
    },
    
    // Error states
    error: null,
    
    // Real-time
    newNotificationsCount: 0,
};

// ===========================================
// REDUCER
// ===========================================

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===========================================
        // USER NOTIFICATIONS
        // ===========================================
        
        case GET_NOTIFICATIONS_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, notifications: true },
                error: null,
            };
            
        case GET_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, notifications: false },
                notifications: action.payload.notifications,
                notificationsPagination: action.payload.pagination,
                error: null,
                newNotificationsCount: 0,
            };
            
        case GET_NOTIFICATIONS_FAIL:
            return {
                ...state,
                loading: { ...state.loading, notifications: false },
                error: action.payload,
                notifications: [],
            };

        // ===========================================
        // NOTIFICATION SUMMARY
        // ===========================================
        
        case GET_NOTIFICATION_SUMMARY_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, summary: true },
                error: null,
            };
            
        case GET_NOTIFICATION_SUMMARY_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, summary: false },
                summary: action.payload,
                error: null,
            };
            
        case GET_NOTIFICATION_SUMMARY_FAIL:
            return {
                ...state,
                loading: { ...state.loading, summary: false },
                error: action.payload,
            };

        // ===========================================
        // MARK AS READ
        // ===========================================
        
        case MARK_NOTIFICATION_READ_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, markingRead: true },
                error: null,
            };
            
        case MARK_NOTIFICATION_READ_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, markingRead: false },
                notifications: state.notifications.map(notification =>
                    notification._id === action.payload.notificationId
                        ? { ...notification, isRead: true, readAt: new Date() }
                        : notification
                ),
                summary: {
                    ...state.summary,
                    unreadCount: Math.max(0, state.summary.unreadCount - 1),
                },
                error: null,
            };
            
        case MARK_NOTIFICATION_READ_FAIL:
            return {
                ...state,
                loading: { ...state.loading, markingRead: false },
                error: action.payload,
            };

        // ===========================================
        // MARK ALL AS READ
        // ===========================================
        
        case MARK_ALL_NOTIFICATIONS_READ_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, markingAllRead: true },
                error: null,
            };
            
        case MARK_ALL_NOTIFICATIONS_READ_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, markingAllRead: false },
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    isRead: true,
                    readAt: new Date(),
                })),
                summary: {
                    ...state.summary,
                    unreadCount: 0,
                },
                error: null,
            };
            
        case MARK_ALL_NOTIFICATIONS_READ_FAIL:
            return {
                ...state,
                loading: { ...state.loading, markingAllRead: false },
                error: action.payload,
            };

        // ===========================================
        // DELETE NOTIFICATION
        // ===========================================
        
        case DELETE_NOTIFICATION_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, deleting: true },
                error: null,
            };
            
        case DELETE_NOTIFICATION_SUCCESS:
            const deletedNotification = state.notifications.find(
                n => n._id === action.payload.notificationId
            );
            const wasUnread = deletedNotification && !deletedNotification.isRead;
            
            return {
                ...state,
                loading: { ...state.loading, deleting: false },
                notifications: state.notifications.filter(
                    notification => notification._id !== action.payload.notificationId
                ),
                summary: {
                    ...state.summary,
                    unreadCount: wasUnread 
                        ? Math.max(0, state.summary.unreadCount - 1)
                        : state.summary.unreadCount,
                },
                error: null,
            };
            
        case DELETE_NOTIFICATION_FAIL:
            return {
                ...state,
                loading: { ...state.loading, deleting: false },
                error: action.payload,
            };

        // ===========================================
        // ADMIN NOTIFICATIONS
        // ===========================================
        
        case ADMIN_NOTIFICATIONS_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, adminNotifications: true },
                error: null,
            };
            
        case ADMIN_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, adminNotifications: false },
                adminNotifications: action.payload.notifications,
                adminPagination: action.payload.pagination,
                error: null,
            };
            
        case ADMIN_NOTIFICATIONS_FAIL:
            return {
                ...state,
                loading: { ...state.loading, adminNotifications: false },
                error: action.payload,
            };

        // ===========================================
        // ADMIN BROADCAST
        // ===========================================
        
        case ADMIN_NOTIFICATION_BROADCAST_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, broadcasting: true },
                error: null,
            };
            
        case ADMIN_NOTIFICATION_BROADCAST_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, broadcasting: false },
                error: null,
            };
            
        case ADMIN_NOTIFICATION_BROADCAST_FAIL:
            return {
                ...state,
                loading: { ...state.loading, broadcasting: false },
                error: action.payload,
            };

        // ===========================================
        // ADMIN STATS
        // ===========================================
        
        case ADMIN_NOTIFICATION_STATS_REQUEST:
            return {
                ...state,
                loading: { ...state.loading, stats: true },
                error: null,
            };
            
        case ADMIN_NOTIFICATION_STATS_SUCCESS:
            return {
                ...state,
                loading: { ...state.loading, stats: false },
                stats: action.payload,
                error: null,
            };
            
        case ADMIN_NOTIFICATION_STATS_FAIL:
            return {
                ...state,
                loading: { ...state.loading, stats: false },
                error: action.payload,
            };

        // ===========================================
        // REAL-TIME NOTIFICATIONS
        // ===========================================
        
        case NOTIFICATION_RECEIVED:
            return {
                ...state,
                summary: {
                    ...state.summary,
                    unreadCount: state.summary.unreadCount + 1,
                    recentNotifications: [
                        action.payload,
                        ...state.summary.recentNotifications.slice(0, 4)
                    ],
                },
                newNotificationsCount: state.newNotificationsCount + 1,
            };

        // ===========================================
        // CLEAR ERRORS
        // ===========================================
        
        case CLEAR_NOTIFICATION_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

export default notificationReducer;
