// ===========================================
// NOTIFICATIONS PAGE
// ===========================================
// Full-featured notifications management page

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
    FaBell,
    FaFilter,
    FaCheck,
    FaRefresh,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
} from 'react-icons/fa';
import styles from './NotificationsPage.module.css';
import NotificationItem from '../../components/NotificationItem/NotificationItem';
import Loader from '../../components/Loader/Loader';
import Message from '../../components/Message/Message';
import {
    getUserNotifications,
    markAllNotificationsAsRead,
    clearNotificationErrors,
} from '../../store/actions/notificationActions';

const NotificationsPage = () => {
    // ===========================================
    // STATE & HOOKS
    // ===========================================

    const dispatch = useDispatch();

    const [filters, setFilters] = useState({
        unreadOnly: false,
        type: 'all',
        priority: 'all',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const { notifications, notificationsPagination, loading, error, summary } = useSelector(
        (state) => state.notifications,
    );

    // ===========================================
    // EFFECTS
    // ===========================================

    useEffect(() => {
        loadNotifications();
    }, [currentPage, filters]);

    useEffect(() => {
        // Clear errors when component mounts
        dispatch(clearNotificationErrors());
    }, [dispatch]);

    // ===========================================
    // HANDLERS
    // ===========================================

    const loadNotifications = React.useCallback(() => {
        const { unreadOnly, type } = filters;
        dispatch(getUserNotifications(currentPage, 20, unreadOnly, type === 'all' ? null : type));
    }, [currentPage, filters, dispatch]);

    const handleRefresh = () => {
        setCurrentPage(1);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllNotificationsAsRead());
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getFilterCount = () => {
        let count = 0;
        if (filters.unreadOnly) count++;
        if (filters.type !== 'all') count++;
        if (filters.priority !== 'all') count++;
        return count;
    };

    // ===========================================
    // RENDER HELPERS
    // ===========================================

    const renderFilters = () => (
        <div className={`${styles.filterPanel} ${showFilters ? styles.visible : ''}`}>
            <h4 className={styles.filterTitle}>
                <FaFilter size={14} />
                Filters
            </h4>

            {/* Unread Only Toggle */}
            <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                    <input
                        type="checkbox"
                        checked={filters.unreadOnly}
                        onChange={(e) => handleFilterChange('unreadOnly', e.target.checked)}
                        className={styles.filterCheckbox}
                    />
                    Show unread only
                </label>
            </div>

            {/* Type Filter */}
            <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Notification Type</label>
                <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Types</option>
                    <option value="order_status">Order Updates</option>
                    <option value="promotion">Promotions</option>
                    <option value="product_back_in_stock">Stock Alerts</option>
                    <option value="system">System</option>
                </select>
            </div>

            {/* Priority Filter */}
            <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Priority</label>
                <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
        </div>
    );

    const renderPagination = () => {
        if (!notificationsPagination || notificationsPagination.totalPages <= 1) return null;

        const { page, totalPages, hasPrev, hasNext } = notificationsPagination;

        return (
            <div className={styles.pagination}>
                <button
                    type="button"
                    className={`${styles.pageBtn} ${!hasPrev ? styles.disabled : ''}`}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrev}
                >
                    <FaChevronLeft size={12} />
                    Previous
                </button>

                <span className={styles.pageInfo}>
                    Page {page} of {totalPages}
                </span>

                <button
                    type="button"
                    className={`${styles.pageBtn} ${!hasNext ? styles.disabled : ''}`}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNext}
                >
                    Next
                    <FaChevronRight size={12} />
                </button>
            </div>
        );
    };

    const renderEmptyState = () => (
        <div className={styles.emptyState}>
            <FaBell className={styles.emptyIcon} size={48} />
            <h3 className={styles.emptyTitle}>
                {filters.unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className={styles.emptyDescription}>
                {filters.unreadOnly
                    ? 'All caught up! You have no unread notifications.'
                    : "You'll see notifications about orders, promotions, and updates here."}
            </p>
            {filters.unreadOnly && (
                <button
                    type="button"
                    className={styles.showAllBtn}
                    onClick={() => handleFilterChange('unreadOnly', false)}
                >
                    Show all notifications
                </button>
            )}
        </div>
    );

    // ===========================================
    // MAIN RENDER
    // ===========================================

    return (
        <div className={styles.container}>
            <Helmet>
                <title>Notifications - Petopia</title>
                <meta
                    name="description"
                    content="Manage your notifications and stay updated with order status, promotions, and more."
                />
            </Helmet>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>
                        <FaBell className={styles.titleIcon} />
                        Notifications
                        {summary?.unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{summary.unreadCount}</span>
                        )}
                    </h1>
                </div>

                <div className={styles.headerActions}>
                    {/* Filter Toggle */}
                    <button
                        type="button"
                        className={`${styles.actionBtn} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Toggle filters"
                    >
                        <FaFilter size={14} />
                        {getFilterCount() > 0 && (
                            <span className={styles.filterCount}>{getFilterCount()}</span>
                        )}
                    </button>

                    {/* Mark All Read */}
                    {summary?.unreadCount > 0 && (
                        <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={handleMarkAllAsRead}
                            disabled={loading.markingAllRead}
                            title="Mark all as read"
                        >
                            <FaCheck size={14} />
                            Mark all read
                        </button>
                    )}

                    {/* Refresh */}
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={handleRefresh}
                        disabled={loading.notifications}
                        title="Refresh notifications"
                    >
                        <FaRefresh size={14} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            {renderFilters()}

            {/* Error Message */}
            {error && (
                <Message variant="danger" className={styles.errorMessage}>
                    <FaExclamationTriangle size={16} />
                    {error}
                </Message>
            )}

            {/* Content */}
            <div className={styles.content}>
                {/* Loading State */}
                {loading.notifications && currentPage === 1 ? (
                    <div className={styles.loading}>
                        <Loader />
                        <p>Loading notifications...</p>
                    </div>
                ) : (
                    <>
                        {/* Notifications List */}
                        {notifications.length > 0 ? (
                            <div className={styles.notificationsList}>
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        showActions={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            renderEmptyState()
                        )}

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
