import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../../hooks/useBreadcrumb';
import { useI18n } from '../../../hooks/useI18n';
import API from '../../../services/api';
import TabNavigation from '../../../components/Admin/TabNavigation';
import DateRangeControls from '../../../components/Admin/DateRangeControls/DateRangeControls';
import {
    OverviewTab,
    SalesTab,
    OrdersTab,
    ProductsTab,
    CustomersTab,
    ConversionTab,
} from '../../../components/Admin/AnalyticsTabs';
import { getDaysInPeriod } from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';
import './styles.css';

const Analytics = () => {
    const { t } = useI18n();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Date range state management
    const [dateRange, setDateRange] = useState('30days');
    const [customDateFrom, setCustomDateFrom] = useState(null);
    const [customDateTo, setCustomDateTo] = useState(null);

    // URL and navigation handling
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab') || 'overview';

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('admin/analytics');

    // Tab configuration
    const tabs = [
        { id: 'overview', label: t('analytics.tabs.overview'), icon: '📊' },
        { id: 'sales', label: t('analytics.tabs.sales'), icon: '💰' },
        { id: 'orders', label: t('analytics.tabs.orders'), icon: '📦' },
        { id: 'products', label: t('analytics.tabs.products'), icon: '🛍️' },
        { id: 'customers', label: t('analytics.tabs.customers'), icon: '👥' },
    ];

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Calculate date range - handle both predefined and custom ranges
            let startDate, endDate;

            if (dateRange === 'custom' && customDateFrom && customDateTo) {
                // Custom date range - ensure we have valid ISO strings
                startDate = customDateFrom.includes('T')
                    ? customDateFrom
                    : new Date(customDateFrom).toISOString();
                endDate = customDateTo.includes('T')
                    ? customDateTo
                    : new Date(customDateTo).toISOString();
            } else {
                // Use predefined range
                const endDateObj = new Date();
                const startDateObj = new Date();
                const days = getDaysInPeriod(dateRange);
                startDateObj.setDate(startDateObj.getDate() - days);

                startDate = startDateObj.toISOString();
                endDate = endDateObj.toISOString();
            }

            console.log('📅 Date range for analytics:', {
                dateRange,
                startDate,
                endDate,
                customDateFrom,
                customDateTo,
            });

            // Parallel API calls for better performance with improved error handling
            const [dashboardResponse, businessResponse] = await Promise.all([
                API.get('/api/analytics/dashboard').catch((err) => {
                    console.error('Dashboard API failed:', err);
                    return { data: { success: false, data: null, error: err.message } };
                }),
                API.get(`/api/analytics/business?startDate=${startDate}&endDate=${endDate}`).catch(
                    (err) => {
                        console.error('Business analytics API failed:', err);
                        return { data: { success: false, data: null, error: err.message } };
                    },
                ),
            ]);

            // Check if APIs returned successful responses
            const dashboardData =
                dashboardResponse.data.success !== false ? dashboardResponse.data.data : null;
            const businessData =
                businessResponse.data.success !== false ? businessResponse.data.data : null;

            // Set data even if some APIs failed
            setAnalyticsData({
                dashboard: dashboardData,
                business: businessData,
            });

            // Set error if both APIs failed
            if (!dashboardData && !businessData) {
                setError(t('analytics.messages.errorLoadingData'));
            } else if (!dashboardData || !businessData) {
                console.warn('Partial analytics data loaded - some features may be limited');
            }
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError(t('analytics.messages.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchRealTimeData = async () => {
        try {
            const response = await API.get('/api/analytics/realtime');
            setRealTimeData(response.data.data);
        } catch (err) {
            console.error('Error fetching real-time data:', err);
            // Don't throw - real-time data is not critical
        }
    };

    useEffect(() => {
        // Initial data fetch
        fetchAnalyticsData();

        // Set up real-time data polling using CONFIG interval
        fetchRealTimeData(); // Initial real-time fetch
        const realtimeInterval = setInterval(fetchRealTimeData, CONFIG.intervals.realTime);

        // Set up periodic analytics refresh (every 5 minutes)
        const analyticsInterval = setInterval(fetchAnalyticsData, CONFIG.intervals.dashboard);

        return () => {
            clearInterval(realtimeInterval);
            clearInterval(analyticsInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, customDateFrom, customDateTo]); // Re-fetch when date range or custom dates change

    const handleDateRangeChange = ({ range, customFrom, customTo }) => {
        setDateRange(range);
        setCustomDateFrom(customFrom);
        setCustomDateTo(customTo);
    };

    const handleTabChange = (tabId) => {
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('tab', tabId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales':
                return <SalesTab analyticsData={analyticsData} dateRange={dateRange} />;
            case 'orders':
                return (
                    <OrdersTab
                        analyticsData={analyticsData}
                        realTimeData={realTimeData}
                        dateRange={dateRange}
                    />
                );
            case 'products':
                return <ProductsTab analyticsData={analyticsData} dateRange={dateRange} />;
            case 'customers':
                return <CustomersTab analyticsData={analyticsData} dateRange={dateRange} />;
            case 'conversion':
                return <ConversionTab analyticsData={analyticsData} dateRange={dateRange} />;
            case 'overview':
            default:
                return (
                    <OverviewTab
                        analyticsData={analyticsData}
                        realTimeData={realTimeData}
                        dateRange={dateRange}
                    />
                );
        }
    };

    if (loading && !analyticsData) {
        return (
            <div className="analytics-page">
                <BreadcrumbNavigation items={breadcrumbItems} />
                <div className="loading-state">{t('analytics.messages.loadingAnalyticsData')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <BreadcrumbNavigation items={breadcrumbItems} />
                <div className="error-state">
                    <h3>{t('common.error')}</h3>
                    <p>{error}</p>
                    <button onClick={fetchAnalyticsData} className="retry-btn">
                        {t('analytics.buttons.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation items={breadcrumbItems} />

            <div className="analytics-header">
                <h1 className="analytics-title">{t('analytics.title')}</h1>
                <DateRangeControls
                    dateRange={dateRange}
                    customDateFrom={customDateFrom}
                    customDateTo={customDateTo}
                    onDateRangeChange={handleDateRangeChange}
                    onRefresh={fetchAnalyticsData}
                    loading={loading}
                />
            </div>

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

            {/* Tab Content */}
            <div className="tab-content">{renderTabContent()}</div>
        </div>
    );
};

export default Analytics;
