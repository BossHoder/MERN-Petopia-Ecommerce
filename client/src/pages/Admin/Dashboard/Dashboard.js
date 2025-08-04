import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../../../store/actions/adminActions';
import StatsCard from '../../../components/Admin/StatsCard/StatsCard';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../../hooks/useBreadcrumb';
import { useI18n } from '../../../hooks/useI18n';
import { formatPrice } from '../../../utils/displayUtils';
import './styles.css';

const Dashboard = () => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    // Get admin state from Redux
    const { dashboardStats, dashboardLoading } = useSelector((state) => state.admin);

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('admin/dashboard');

    useEffect(() => {
        // Fetch dashboard stats from API
        dispatch(getDashboardStats());
    }, [dispatch]);

    const statsCards = [
        {
            title: t('admin.dashboard.totalOrders', 'Total Orders'),
            value: dashboardStats.totalOrders || 0,
            icon: '📦',
            trend: 'up',
            trendValue: dashboardStats.growth?.orders || 0,
            color: 'primary',
        },

        {
            title: t('admin.dashboard.totalProducts', 'Total Products'),
            value: dashboardStats.totalProducts || 0,
            icon: '🛍️',
            trend: 'up',
            trendValue: 0, // Products don't have growth tracking yet
            color: 'info',
        },
        {
            title: t('admin.dashboard.totalUsers', 'Total Users'),
            value: dashboardStats.totalUsers || 0,
            icon: '👥',
            trend: 'up',
            trendValue: dashboardStats.growth?.users || 0,
            color: 'warning',
        },
    ];

    return (
        <div className="admin-dashboard">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.adminDashboard', 'Admin dashboard navigation')}
            />

            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    {t('admin.dashboard.title', 'Dashboard Overview')}
                </h1>
                <p className="dashboard-subtitle">
                    {t(
                        'admin.dashboard.subtitle',
                        "Welcome back! Here's what's happening with your store.",
                    )}
                </p>
            </div>

            {/* Stats Cards Grid */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <StatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                        trendValue={stat.trendValue}
                        color={stat.color}
                        loading={dashboardLoading}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
