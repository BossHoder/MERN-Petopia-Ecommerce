// ===========================================
// ADMIN NOTIFICATIONS MANAGEMENT PAGE
// ===========================================
// Complete notification management interface for administrators

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
    FaBell,
    FaBroadcastTower,
    FaChartBar,
    FaFilter,
    FaRefresh,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
    FaUsers,
    FaEye,
    FaClock,
} from 'react-icons/fa';
import './styles.css';
import NotificationItem from '../../../components/NotificationItem/NotificationItem';
import {
    getAdminNotifications,
    broadcastNotification,
    getNotificationStats,
} from '../../../store/actions/notificationActions';

const AdminNotifications = () => {
    // ===========================================
    // STATE & HOOKS
    // ===========================================

    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('overview'); // overview, broadcast, manage
    const [filters, setFilters] = useState({
        type: 'all',
        priority: 'all',
        dateRange: '7days',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Broadcast form state
    const [broadcastForm, setBroadcastForm] = useState({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium',
        targetAudience: 'all', // all, active_users, specific_users
        userIds: [],
        channels: ['app'],
        expiresAt: '',
    });

    const { adminNotifications, adminPagination, stats, loading, error } = useSelector(
        (state) => state.notifications,
    );

    // ===========================================
    // EFFECTS
    // ===========================================

    useEffect(() => {
        dispatch(getNotificationStats());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'manage') {
            loadNotifications();
        }
    }, [activeTab, currentPage, filters]);

    // ===========================================
    // HANDLERS
    // ===========================================

    const loadNotifications = React.useCallback(() => {
        const filterObj = {};
        if (filters.type !== 'all') filterObj.type = filters.type;
        if (filters.priority !== 'all') filterObj.priority = filters.priority;

        dispatch(getAdminNotifications(currentPage, 20, filterObj));
    }, [currentPage, filters, dispatch]);

    const handleBroadcast = async (e) => {
        e.preventDefault();

        try {
            await dispatch(broadcastNotification(broadcastForm));

            // Reset form
            setBroadcastForm({
                title: '',
                message: '',
                type: 'system',
                priority: 'medium',
                targetAudience: 'all',
                userIds: [],
                channels: ['app'],
                expiresAt: '',
            });

            // Refresh stats
            dispatch(getNotificationStats());
        } catch (error) {
            console.error('Failed to broadcast notification:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        dispatch(getNotificationStats());
        if (activeTab === 'manage') {
            loadNotifications();
        }
    };

    // ===========================================
    // RENDER HELPERS
    // ===========================================

    const renderOverviewTab = () => (
        <div className="overview-content">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBell />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.total || 0}</h3>
                        <p>Total Notifications</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaEye />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.unread || 0}</h3>
                        <p>Unread Notifications</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <h3>{Object.values(stats.byType || {}).reduce((a, b) => a + b, 0)}</h3>
                        <p>Active Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaClock />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.recentActivity?.length || 0}</h3>
                        <p>Recent Activity</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h4>Notifications by Type</h4>
                    <div className="chart-content">
                        {Object.entries(stats.byType || {}).map(([type, count]) => (
                            <div key={type} className="chart-bar">
                                <span className="chart-label">{type}</span>
                                <div className="chart-bar-bg">
                                    <div
                                        className="chart-bar-fill"
                                        style={{
                                            width: `${
                                                (count /
                                                    Math.max(
                                                        ...Object.values(stats.byType || {}),
                                                    )) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="chart-value">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card">
                    <h4>Notifications by Priority</h4>
                    <div className="chart-content">
                        {Object.entries(stats.byPriority || {}).map(([priority, count]) => (
                            <div key={priority} className={`priority-item priority-${priority}`}>
                                <span className="priority-label">{priority}</span>
                                <span className="priority-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBroadcastTab = () => (
        <div className="broadcast-content">
            <div className="broadcast-header">
                <h3>
                    <FaBroadcastTower />
                    Broadcast Notification
                </h3>
                <p>Send notifications to multiple users at once</p>
            </div>

            <form onSubmit={handleBroadcast} className="broadcast-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={broadcastForm.title}
                            onChange={(e) =>
                                setBroadcastForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            required
                            placeholder="Enter notification title"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select
                            id="type"
                            value={broadcastForm.type}
                            onChange={(e) =>
                                setBroadcastForm((prev) => ({
                                    ...prev,
                                    type: e.target.value,
                                }))
                            }
                        >
                            <option value="system">System</option>
                            <option value="promotion">Promotion</option>
                            <option value="announcement">Announcement</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                        id="message"
                        value={broadcastForm.message}
                        onChange={(e) =>
                            setBroadcastForm((prev) => ({
                                ...prev,
                                message: e.target.value,
                            }))
                        }
                        required
                        rows={4}
                        placeholder="Enter notification message"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={broadcastForm.priority}
                            onChange={(e) =>
                                setBroadcastForm((prev) => ({
                                    ...prev,
                                    priority: e.target.value,
                                }))
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="targetAudience">Target Audience</label>
                        <select
                            id="targetAudience"
                            value={broadcastForm.targetAudience}
                            onChange={(e) =>
                                setBroadcastForm((prev) => ({
                                    ...prev,
                                    targetAudience: e.target.value,
                                }))
                            }
                        >
                            <option value="all">All Users</option>
                            <option value="active_users">Active Users</option>
                            <option value="specific_users">Specific Users</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="expiresAt">Expires At (Optional)</label>
                    <input
                        type="datetime-local"
                        id="expiresAt"
                        value={broadcastForm.expiresAt}
                        onChange={(e) =>
                            setBroadcastForm((prev) => ({
                                ...prev,
                                expiresAt: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading.broadcasting}
                    >
                        {loading.broadcasting ? 'Broadcasting...' : 'Send Broadcast'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderManageTab = () => (
        <div className="manage-content">
            {/* Filters */}
            <div className="manage-filters">
                <div className="filter-group">
                    <FaFilter />
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="order_status">Order Updates</option>
                        <option value="promotion">Promotions</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div className="search-group">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {loading.adminNotifications ? (
                    <div className="loading-state">Loading notifications...</div>
                ) : adminNotifications.length > 0 ? (
                    adminNotifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            showActions={false}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <FaBell size={48} />
                        <h3>No notifications found</h3>
                        <p>No notifications match your current filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {adminPagination && adminPagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        type="button"
                        className="page-btn"
                        onClick={() => handlePageChange(adminPagination.page - 1)}
                        disabled={!adminPagination.hasPrev}
                    >
                        <FaChevronLeft /> Previous
                    </button>

                    <span className="page-info">
                        Page {adminPagination.page} of {adminPagination.totalPages}
                    </span>

                    <button
                        type="button"
                        className="page-btn"
                        onClick={() => handlePageChange(adminPagination.page + 1)}
                        disabled={!adminPagination.hasNext}
                    >
                        Next <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );

    // ===========================================
    // MAIN RENDER
    // ===========================================

    return (
        <div className="admin-notifications">
            <Helmet>
                <title>Notifications Management - Admin - Petopia</title>
            </Helmet>

            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>
                        <FaBell />
                        Notifications Management
                    </h1>
                    <p>Manage and broadcast notifications to users</p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRefresh}
                        disabled={loading.stats}
                    >
                        <FaRefresh />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FaExclamationTriangle />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs-nav">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaChartBar />
                        Overview
                    </button>

                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
                        onClick={() => setActiveTab('broadcast')}
                    >
                        <FaBroadcastTower />
                        Broadcast
                    </button>

                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        <FaBell />
                        Manage
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'broadcast' && renderBroadcastTab()}
                    {activeTab === 'manage' && renderManageTab()}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
