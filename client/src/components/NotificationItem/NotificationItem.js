// ===========================================
// NOTIFICATION ITEM COMPONENT
// ===========================================
// Individual notification display with actions

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Loader';
import {
    FaBox,
    FaGift,
    FaExclamationTriangle,
    FaInfoCircle,
    FaCheck,
    FaTrash,
    FaClock,
} from 'react-icons/fa';
import styles from './NotificationItem.module.css';
import {
    markNotificationAsRead,
    deleteNotification,
} from '../../store/actions/notificationActions';

const NotificationItem = ({ notification, onClick, showActions = true }) => {
    // ===========================================
    // STATE & HOOKS
    // ===========================================

    const [isDeleting, setIsDeleting] = useState(false);
    const dispatch = useDispatch();

    const { loading } = useSelector((state) => state.notifications);

    // ===========================================
    // HANDLERS
    // ===========================================

    const handleClick = async (e) => {
        e.preventDefault();

        // Mark as read if unread
        if (!notification.isRead) {
            try {
                await dispatch(markNotificationAsRead(notification._id));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        // Call parent onClick handler
        if (onClick) {
            onClick(notification);
        }
    };

    const handleMarkAsRead = async (e) => {
        e.stopPropagation();

        try {
            await dispatch(markNotificationAsRead(notification._id));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (isDeleting) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteNotification(notification._id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
            setIsDeleting(false);
        }
    };

    // ===========================================
    // HELPER FUNCTIONS
    // ===========================================

    const getNotificationIcon = (type, priority) => {
        switch (type) {
            case 'order_status':
                return <FaBox className={styles.icon} />;
            case 'promotion':
                return <FaGift className={styles.icon} />;
            case 'product_back_in_stock':
                return <FaBox className={styles.icon} />;
            case 'system':
                return priority === 'high' || priority === 'urgent' ? (
                    <FaExclamationTriangle className={styles.icon} />
                ) : (
                    <FaInfoCircle className={styles.icon} />
                );
            default:
                return <FaInfoCircle className={styles.icon} />;
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'urgent':
                return styles.urgent;
            case 'high':
                return styles.high;
            case 'medium':
                return styles.medium;
            case 'low':
                return styles.low;
            default:
                return styles.medium;
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diff = now - notificationDate;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return notificationDate.toLocaleDateString();
    };

    // ===========================================
    // COMPUTED VALUES
    // ===========================================

    const isUnread = !notification.isRead;
    const priorityClass = getPriorityClass(notification.priority);
    const timeAgo = formatTimeAgo(notification.createdAt);

    // ===========================================
    // RENDER
    // ===========================================

    return (
        <div
            className={`${styles.notificationItem} ${
                isUnread ? styles.unread : ''
            } ${priorityClass}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(e);
                }
            }}
            aria-label={`Notification: ${notification.title}. ${isUnread ? 'Unread' : 'Read'}`}
        >
            {/* Priority Indicator */}
            {(notification.priority === 'urgent' || notification.priority === 'high') && (
                <div className={`${styles.priorityIndicator} ${priorityClass}`} />
            )}

            {/* Content */}
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    {/* Icon & Title */}
                    <div className={styles.titleSection}>
                        {getNotificationIcon(notification.type, notification.priority)}
                        <h4 className={styles.title}>
                            {notification.title}
                            {isUnread && <span className={styles.unreadDot} />}
                        </h4>
                    </div>

                    {/* Timestamp */}
                    <div className={styles.timestamp}>
                        <FaClock size={10} />
                        <span>{timeAgo}</span>
                    </div>
                </div>

                {/* Message */}
                <p className={styles.message}>{notification.message}</p>

                {/* Metadata */}
                {notification.metadata && (
                    <div className={styles.metadata}>
                        {notification.metadata.orderId && (
                            <span className={styles.metadataItem}>
                                Order #{notification.metadata.orderId.slice(-8)}
                            </span>
                        )}
                        {notification.metadata.productName && (
                            <span className={styles.metadataItem}>
                                {notification.metadata.productName}
                            </span>
                        )}
                        {notification.metadata.promotionCode && (
                            <span className={styles.metadataItem}>
                                Code: {notification.metadata.promotionCode}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className={styles.actions}>
                        {isUnread && (
                            <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={handleMarkAsRead}
                                disabled={loading.markingRead}
                                title="Mark as read"
                                aria-label="Mark as read"
                            >
                                <FaCheck size={12} />
                            </button>
                        )}

                        <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={handleDelete}
                            disabled={isDeleting || loading.deleting}
                            title="Delete notification"
                            aria-label="Delete notification"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {(isDeleting || loading.deleting) && (
                <div className={styles.loadingOverlay}>
                    <Loader size="sm" />
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
