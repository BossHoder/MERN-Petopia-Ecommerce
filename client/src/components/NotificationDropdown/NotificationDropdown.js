// ===========================================
// NOTIFICATION DROPDOWN COMPONENT
// ===========================================
// Dropdown panel that shows recent notifications and actions

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaEye, FaChevronRight, FaBell } from 'react-icons/fa';
import styles from './NotificationDropdown.module.css';
import NotificationItem from '../NotificationItem/NotificationItem';
import {
    markAllNotificationsAsRead,
    getUserNotifications,
} from '../../store/actions/notificationActions';

const NotificationDropdown = ({ onClose, notifications, unreadCount }) => {
    // ===========================================
    // STATE & HOOKS
    // ===========================================

    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading } = useSelector((state) => state.notifications);

    // ===========================================
    // HANDLERS
    // ===========================================

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead());
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleViewAllNotifications = () => {
        navigate('/notifications');
        onClose();
    };

    const handleShowMoreRecent = async () => {
        try {
            setShowAllNotifications(true);
            await dispatch(getUserNotifications(1, 10, false));
        } catch (error) {
            console.error('Failed to load more notifications:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Handle notification click based on type
        switch (notification.type) {
            case 'order_status':
                if (notification.metadata?.orderId) {
                    navigate(`/orders/${notification.metadata.orderId}`);
                }
                break;
            case 'product_back_in_stock':
                if (notification.metadata?.productId) {
                    navigate(`/products/${notification.metadata.productId}`);
                }
                break;
            case 'promotion':
                if (notification.metadata?.promotionUrl) {
                    navigate(notification.metadata.promotionUrl);
                }
                break;
            default:
                // Do nothing for general notifications
                break;
        }

        onClose();
    };

    // ===========================================
    // COMPUTED VALUES
    // ===========================================

    const displayNotifications = showAllNotifications ? notifications : notifications.slice(0, 5);

    const hasMoreNotifications = notifications.length > 5;
    const showMarkAllRead = unreadCount > 0;

    // ===========================================
    // RENDER
    // ===========================================

    return (
        <div className={styles.dropdown} role="dialog" aria-label="Notifications">
            {/* Header */}
            <div className={styles.header}>
                <h3 className={styles.title}>
                    Notifications
                    {unreadCount > 0 && (
                        <span className={styles.unreadCount}>({unreadCount} unread)</span>
                    )}
                </h3>

                {/* Header Actions */}
                <div className={styles.headerActions}>
                    {showMarkAllRead && (
                        <button
                            type="button"
                            className={styles.markAllReadBtn}
                            onClick={handleMarkAllAsRead}
                            disabled={loading.markingAllRead}
                            title="Mark all as read"
                        >
                            <FaCheck size={12} />
                            {loading.markingAllRead ? 'Marking...' : 'Mark all read'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Loading State */}
                {loading.notifications && (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner} />
                        <span>Loading notifications...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading.notifications && displayNotifications.length === 0 && (
                    <div className={styles.emptyState}>
                        <FaBell className={styles.emptyIcon} size={32} />
                        <p className={styles.emptyMessage}>No notifications yet</p>
                        <span className={styles.emptyDescription}>
                            You'll see notifications about your orders, promotions, and more here.
                        </span>
                    </div>
                )}

                {/* Notification List */}
                {!loading.notifications && displayNotifications.length > 0 && (
                    <div className={styles.notificationList}>
                        {displayNotifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}

                {/* Show More Button */}
                {!showAllNotifications && hasMoreNotifications && !loading.notifications && (
                    <button
                        type="button"
                        className={styles.showMoreBtn}
                        onClick={handleShowMoreRecent}
                        disabled={loading.notifications}
                    >
                        <FaEye size={12} />
                        Show more recent
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button
                    type="button"
                    className={styles.viewAllBtn}
                    onClick={handleViewAllNotifications}
                >
                    View all notifications
                    <FaChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
