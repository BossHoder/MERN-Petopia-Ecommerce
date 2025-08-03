import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';
import StatsCard from '../../../../components/Admin/StatsCard/StatsCard';
import './TabStyles.css';

const OverviewTab = ({ dateRange, onDateRangeChange }) => {
    const [overviewData, setOverviewData] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const endDate = new Date().toISOString();
            const startDate = new Date();

            switch (dateRange) {
                case '7days':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30days':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90days':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case '1year':
                    startDate.setDate(startDate.getDate() - 365);
                    break;
                default:
                    startDate.setDate(startDate.getDate() - 30);
            }

            const [dashboardResponse, businessResponse, realtimeResponse] = await Promise.all([
                API.get('/api/analytics/dashboard'),
                API.get(
                    `/api/analytics/business?startDate=${startDate.toISOString()}&endDate=${endDate}`,
                ),
                API.get('/api/analytics/realtime').catch(() => ({ data: { data: null } })),
            ]);

            setOverviewData({
                dashboard: dashboardResponse.data.data,
                business: businessResponse.data.data,
            });
            setRealTimeData(realtimeResponse.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching overview data:', err);
            setError('Failed to load overview data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverviewData();

        // Set up real-time data polling
        const interval = setInterval(() => {
            API.get('/api/analytics/realtime')
                .then((response) => setRealTimeData(response.data.data))
                .catch((err) => console.error('Real-time data error:', err));
        }, 30000);

        return () => clearInterval(interval);
    }, [dateRange]);

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="loading-spinner"></div>
                <p>Loading overview data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <h3>Error Loading Data</h3>
                <p>{error}</p>
                <button onClick={fetchOverviewData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const businessData = overviewData?.business;
    const dashboardData = overviewData?.dashboard;

    return (
        <div className="tab-content overview-tab">
            {/* Page Header */}
            <div className="tab-header">
                <h2 className="tab-title">📊 Business Overview</h2>
                <p className="tab-description">
                    Key performance indicators and business health metrics for the selected period
                </p>
            </div>

            {/* Real-Time Metrics */}
            {realTimeData && (
                <div className="section">
                    <h3 className="section-title">🔴 Real-Time Activity</h3>
                    <div className="realtime-grid">
                        <div className="realtime-card">
                            <div className="realtime-icon">👥</div>
                            <div className="realtime-content">
                                <h4>{realTimeData.activeUsers || 0}</h4>
                                <p>Active Users</p>
                            </div>
                        </div>
                        <div className="realtime-card">
                            <div className="realtime-icon">📈</div>
                            <div className="realtime-content">
                                <h4>{realTimeData.todayEvents || 0}</h4>
                                <p>Events Today</p>
                            </div>
                        </div>
                        <div className="realtime-card">
                            <div className="realtime-icon">🆕</div>
                            <div className="realtime-content">
                                <h4>{realTimeData.recentSignups || 0}</h4>
                                <p>New Signups</p>
                            </div>
                        </div>
                        <div className="realtime-card">
                            <div className="realtime-icon">🛒</div>
                            <div className="realtime-content">
                                <h4>{realTimeData.recentOrders?.length || 0}</h4>
                                <p>Recent Orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            {businessData && (
                <div className="section">
                    <h3 className="section-title">💼 Key Business Metrics</h3>
                    <div className="stats-grid">
                        <StatsCard
                            title="Total Revenue"
                            value={`$${(businessData.revenue?.totalRevenue || 0).toLocaleString()}`}
                            icon="💰"
                            color="success"
                            subtitle={`From ${businessData.revenue?.totalOrders || 0} orders`}
                        />
                        <StatsCard
                            title="Average Order Value"
                            value={`$${(businessData.revenue?.averageOrderValue || 0).toFixed(2)}`}
                            icon="📊"
                            color="info"
                            subtitle="Per transaction"
                        />
                        <StatsCard
                            title="Conversion Rate"
                            value={`${
                                businessData.conversion?.order_completed?.conversionRate || 0
                            }%`}
                            icon="🎯"
                            color="warning"
                            subtitle="Visitors to customers"
                        />
                        <StatsCard
                            title="New Customers"
                            value={businessData.customers?.newCustomers || 0}
                            icon="👥"
                            color="primary"
                            subtitle="In selected period"
                        />
                    </div>
                </div>
            )}

            {/* Quick Insights */}
            <div className="section">
                <h3 className="section-title">🔍 Quick Insights</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>🏆 Top Product</h4>
                        <p className="insight-value">
                            {businessData?.products?.topSellingProducts?.[0]?.productInfo?.name ||
                                'N/A'}
                        </p>
                        <span className="insight-detail">
                            {businessData?.products?.topSellingProducts?.[0]?.totalQuantity || 0}{' '}
                            sold
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>💎 Customer LTV</h4>
                        <p className="insight-value">
                            $
                            {(
                                businessData?.customers?.lifetimeValue?.averageLifetimeValue || 0
                            ).toFixed(2)}
                        </p>
                        <span className="insight-detail">Average lifetime value</span>
                    </div>
                    <div className="insight-card">
                        <h4>🔄 Retention Rate</h4>
                        <p className="insight-value">
                            {businessData?.customers?.retention?.retentionRate || 0}%
                        </p>
                        <span className="insight-detail">Customer retention</span>
                    </div>
                    <div className="insight-card">
                        <h4>📦 Products</h4>
                        <p className="insight-value">
                            {businessData?.products?.productMetrics?.totalProducts || 0}
                        </p>
                        <span className="insight-detail">
                            {businessData?.products?.productMetrics?.lowStockProducts || 0} low
                            stock
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {realTimeData?.recentOrders && realTimeData.recentOrders.length > 0 && (
                <div className="section">
                    <h3 className="section-title">🕒 Recent Orders</h3>
                    <div className="recent-orders">
                        {realTimeData.recentOrders.slice(0, 5).map((order) => (
                            <div key={order._id} className="order-item">
                                <div className="order-info">
                                    <span className="order-number">#{order.orderNumber}</span>
                                    <span className="customer-name">
                                        {order.user?.name || 'Guest Customer'}
                                    </span>
                                </div>
                                <div className="order-details">
                                    <span className="order-total">
                                        ${(order.pricing?.total || 0).toFixed(2)}
                                    </span>
                                    <span className="order-time">
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
