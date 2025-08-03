import React, { useEffect, useState } from 'react';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../../hooks/useBreadcrumb';
import API from '../../../services/api';
import StatsCard from '../../../components/Admin/StatsCard/StatsCard';
import './styles.css';

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30days');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('admin/analytics');

    const fetchAnalyticsData = async () => {
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
                default:
                    startDate.setDate(startDate.getDate() - 30);
            }

            const [dashboardResponse, businessResponse] = await Promise.all([
                API.get('/api/analytics/dashboard'),
                API.get(
                    `/api/analytics/business?startDate=${startDate.toISOString()}&endDate=${endDate}`,
                ),
            ]);

            setAnalyticsData({
                dashboard: dashboardResponse.data.data,
                business: businessResponse.data.data,
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError('Failed to load analytics data');
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
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
        const interval = setInterval(fetchRealTimeData, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    if (loading && !analyticsData) {
        return (
            <div className="analytics-page">
                <BreadcrumbNavigation items={breadcrumbItems} />
                <div className="loading-state">Loading analytics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <BreadcrumbNavigation items={breadcrumbItems} />
                <div className="error-state">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchAnalyticsData} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const businessData = analyticsData?.business;

    return (
        <div className="analytics-page">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation items={breadcrumbItems} />

            <div className="analytics-header">
                <h1 className="analytics-title">Business Analytics</h1>
                <div className="analytics-controls">
                    <select
                        value={dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        className="date-range-select"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                    </select>
                    <button onClick={fetchAnalyticsData} className="refresh-btn">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Real-Time Stats */}
            {realTimeData && (
                <div className="realtime-section">
                    <h2>Real-Time Activity</h2>
                    <div className="realtime-grid">
                        <div className="realtime-card">
                            <h3>{realTimeData.activeUsers}</h3>
                            <p>Active Users</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.todayEvents}</h3>
                            <p>Events Today</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.recentSignups}</h3>
                            <p>New Signups</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.recentOrders?.length || 0}</h3>
                            <p>Recent Orders</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Analytics */}
            {businessData?.revenue && (
                <div className="revenue-section">
                    <h2>Revenue Analytics</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title="Total Revenue"
                            value={`${businessData.revenue.totalRevenue.toLocaleString()}đ`}
                            icon="💰"
                            color="success"
                        />
                        <StatsCard
                            title="Total Orders"
                            value={businessData.revenue.totalOrders}
                            icon="📦"
                            color="primary"
                        />
                        <StatsCard
                            title="Average Order Value"
                            value={`${businessData.revenue.averageOrderValue.toFixed(0)}đ`}
                            icon="📊"
                            color="info"
                        />
                        <StatsCard
                            title="Conversion Rate"
                            value={`${
                                businessData.conversion?.order_completed?.conversionRate || 0
                            }%`}
                            icon="🎯"
                            color="warning"
                        />
                    </div>
                </div>
            )}

            {/* Product Analytics */}
            {businessData?.products && (
                <div className="products-section">
                    <h2>Product Performance</h2>
                    <div className="product-analytics">
                        <div className="top-products">
                            <h3>Top Selling Products</h3>
                            <div className="products-list">
                                {businessData.products.topSellingProducts
                                    ?.slice(0, 5)
                                    .map((product, index) => (
                                        <div key={product._id} className="product-item">
                                            <span className="rank">#{index + 1}</span>
                                            <span className="product-name">
                                                {product.productInfo?.name}
                                            </span>
                                            <span className="product-sales">
                                                {product.totalQuantity} sold
                                            </span>
                                                                            <span className="product-revenue">
                                    {product.totalRevenue.toFixed(0)}đ
                                </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="product-metrics">
                            <h3>Product Metrics</h3>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <h4>
                                        {businessData.products.productMetrics?.totalProducts || 0}
                                    </h4>
                                    <p>Total Products</p>
                                </div>
                                <div className="metric-item">
                                    <h4>
                                        {businessData.products.productMetrics?.lowStockProducts ||
                                            0}
                                    </h4>
                                    <p>Low Stock</p>
                                </div>
                                <div className="metric-item">
                                    <h4>
                                        {businessData.products.productMetrics?.outOfStockProducts ||
                                            0}
                                    </h4>
                                    <p>Out of Stock</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Analytics */}
            {businessData?.customers && (
                <div className="customers-section">
                    <h2>Customer Analytics</h2>
                    <div className="customer-analytics">
                        <div className="customer-metrics">
                            <StatsCard
                                title="New Customers"
                                value={businessData.customers.newCustomers}
                                icon="👥"
                                color="success"
                            />
                            <StatsCard
                                title="Average LTV"
                                                            value={`${(
                                businessData.customers.lifetimeValue?.averageLifetimeValue || 0
                            ).toFixed(0)}đ`}
                                icon="💎"
                                color="info"
                            />
                            <StatsCard
                                title="Customer Retention"
                                value={`${businessData.customers.retention?.retentionRate || 0}%`}
                                icon="🔄"
                                color="warning"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Conversion Funnel */}
            {businessData?.conversion && (
                <div className="conversion-section">
                    <h2>Conversion Funnel</h2>
                    <div className="funnel-chart">
                        {Object.entries(businessData.conversion).map(([step, data]) => (
                            <div key={step} className="funnel-step">
                                <div className="step-name">
                                    {step.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="step-count">{data.count}</div>
                                <div className="step-rate">{data.conversionRate}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            {realTimeData?.recentOrders && (
                <div className="recent-orders-section">
                    <h2>Recent Orders</h2>
                    <div className="orders-list">
                        {realTimeData.recentOrders.map((order) => (
                            <div key={order._id} className="order-item">
                                <span className="order-number">#{order.orderNumber}</span>
                                <span className="customer-name">{order.user?.name || 'Guest'}</span>
                                <span className="order-total">
                                    {order.pricing?.total?.toFixed(0) || '0'}đ
                                </span>
                                <span className="order-date">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
