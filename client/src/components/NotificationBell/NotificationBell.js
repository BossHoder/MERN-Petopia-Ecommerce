// ===========================================
// NOTIFICATION BELL COMPONENT
// ===========================================
// Icon button that shows unread notification count and toggles dropdown

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import styles from './NotificationBell.module.css';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import { getNotificationSummary } from '../../store/actions/notificationActions';

const NotificationBell = () => {
    // ===========================================
    // STATE & HOOKS
    // ===========================================

    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);
    const dispatch = useDispatch();

    const { summary, loading, newNotificationsCount } = useSelector((state) => state.notifications);

    const { isAuthenticated } = useSelector((state) => state.auth);

    // ===========================================
    // EFFECTS
    // ===========================================

    // Fetch notification summary on component mount and when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getNotificationSummary());
        }
    }, [dispatch, isAuthenticated]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Auto-refresh summary every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            dispatch(getNotificationSummary());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [dispatch, isAuthenticated]);

    // ===========================================
    // HANDLERS
    // ===========================================

    const handleBellClick = () => {
        setIsOpen((prev) => !prev);
    };

    const handleDropdownClose = () => {
        setIsOpen(false);
    };

    // ===========================================
    // COMPUTED VALUES
    // ===========================================

    const unreadCount = summary?.unreadCount || 0;
    const hasNewNotifications = newNotificationsCount > 0;
    const displayCount = unreadCount > 99 ? '99+' : unreadCount;

    // Don't render if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // ===========================================
    // RENDER
    // ===========================================

    return (
        <div className={styles.container} ref={bellRef}>
            {/* Bell Button */}
            <button
                type="button"
                className={`${styles.bellButton} ${isOpen ? styles.active : ''} ${
                    hasNewNotifications ? styles.newNotifications : ''
                }`}
                onClick={handleBellClick}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                disabled={loading.summary}
                title={`${unreadCount} unread notifications`}
            >
                {/* Bell Icon */}
                <FaBell
                    className={`${styles.bellIcon} ${hasNewNotifications ? styles.pulse : ''}`}
                    size={20}
                />

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span
                        className={`${styles.badge} ${hasNewNotifications ? styles.newBadge : ''}`}
                        aria-label={`${unreadCount} unread notifications`}
                    >
                        {displayCount}
                    </span>
                )}

                {/* Loading Indicator */}
                {loading.summary && <div className={styles.loadingSpinner} />}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <NotificationDropdown
                    onClose={handleDropdownClose}
                    notifications={summary?.recentNotifications || []}
                    unreadCount={unreadCount}
                />
            )}
        </div>
    );
};

export default NotificationBell;
