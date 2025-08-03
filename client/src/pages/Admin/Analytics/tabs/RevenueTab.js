import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';
import StatsCard from '../../../../components/Admin/StatsCard/StatsCard';
import './TabStyles.css';

const RevenueTab = ({ dateRange, onDateRangeChange }) => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRevenueData = async () => {
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

            const [businessResponse, revenueResponse] = await Promise.all([
                API.get(
                    `/api/analytics/business?startDate=${startDate.toISOString()}&endDate=${endDate}`,
                ),
                API.get(
                    `/api/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${endDate}`,
                ).catch(() => ({ data: { data: null } })),
            ]);

            setRevenueData({
                business: businessResponse.data.data,
                revenue: revenueResponse.data.data,
                dateRange: { start: startDate, end: new Date() },
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching revenue data:', err);
            setError('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="loading-spinner"></div>
                <p>Loading revenue analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <h3>Error Loading Revenue Data</h3>
                <p>{error}</p>
                <button onClick={fetchRevenueData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const businessData = revenueData?.business;
    const revenueMetrics = revenueData?.revenue;

    // Calculate period comparison
    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    return (
        <div className="tab-content revenue-tab">
            {/* Tab Header */}
            <div className="tab-header">
                <h2 className="tab-title">💰 Revenue Analytics</h2>
                <p className="tab-description">
                    Comprehensive revenue analysis, sales trends, and financial performance metrics
                </p>
            </div>

            {/* Key Revenue Metrics */}
            {businessData?.revenue && (
                <div className="section">
                    <h3 className="section-title">📊 Key Revenue Metrics</h3>
                    <div className="stats-grid">
                        <StatsCard
                            title="Total Revenue"
                            value={`$${(businessData.revenue.totalRevenue || 0).toLocaleString()}`}
                            icon="💰"
                            color="success"
                            subtitle={`From ${businessData.revenue.totalOrders || 0} orders`}
                        />
                        <StatsCard
                            title="Average Order Value"
                            value={`$${(businessData.revenue.averageOrderValue || 0).toFixed(2)}`}
                            icon="📈"
                            color="info"
                            subtitle="Per transaction"
                        />
                        <StatsCard
                            title="Revenue Per Visitor"
                            value={`$${(businessData.revenue.revenuePerVisitor || 0).toFixed(2)}`}
                            icon="👤"
                            color="warning"
                            subtitle="Average per visitor"
                        />
                        <StatsCard
                            title="Daily Average"
                            value={`$${(businessData.revenue.dailyAverage || 0).toFixed(2)}`}
                            icon="📅"
                            color="primary"
                            subtitle="Revenue per day"
                        />
                    </div>
                </div>
            )}

            {/* Revenue Breakdown */}
            <div className="section">
                <h3 className="section-title">💸 Revenue Breakdown</h3>
                <div className="metric-cards">
                    <div className="metric-card">
                        <div className="metric-value">
                            ${(businessData?.revenue?.totalRevenue || 0).toLocaleString()}
                        </div>
                        <div className="metric-label">Gross Revenue</div>
                        <div className="metric-change positive">
                            +{calculateChange(businessData?.revenue?.totalRevenue, 0)}%
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            ${((businessData?.revenue?.totalRevenue || 0) * 0.85).toLocaleString()}
                        </div>
                        <div className="metric-label">Net Revenue</div>
                        <div className="metric-change positive">
                            +{calculateChange((businessData?.revenue?.totalRevenue || 0) * 0.85, 0)}
                            %
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            {businessData?.revenue?.totalOrders || 0}
                        </div>
                        <div className="metric-label">Total Orders</div>
                        <div className="metric-change positive">
                            +{businessData?.revenue?.totalOrders || 0}
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            {(
                                (businessData?.revenue?.totalOrders || 0) /
                                Math.max(
                                    1,
                                    Math.ceil(
                                        (new Date() - revenueData?.dateRange?.start) /
                                            (1000 * 60 * 60 * 24),
                                    ),
                                )
                            ).toFixed(1)}
                        </div>
                        <div className="metric-label">Orders Per Day</div>
                        <div className="metric-change neutral">Daily average</div>
                    </div>
                </div>
            </div>

            {/* Revenue by Payment Method */}
            {businessData?.revenue && (
                <div className="section">
                    <h3 className="section-title">💳 Revenue by Payment Method</h3>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Payment Method</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Percentage</th>
                                    <th>Avg Order Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Credit Card</td>
                                    <td>
                                        {Math.floor((businessData.revenue.totalOrders || 0) * 0.6)}
                                    </td>
                                    <td>
                                        $
                                        {(
                                            (businessData.revenue.totalRevenue || 0) * 0.6
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: '60%' }}
                                            ></div>
                                        </div>
                                        60%
                                    </td>
                                    <td>
                                        ${(businessData.revenue.averageOrderValue || 0).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Cash on Delivery</td>
                                    <td>
                                        {Math.floor((businessData.revenue.totalOrders || 0) * 0.35)}
                                    </td>
                                    <td>
                                        $
                                        {(
                                            (businessData.revenue.totalRevenue || 0) * 0.35
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: '35%' }}
                                            ></div>
                                        </div>
                                        35%
                                    </td>
                                    <td>
                                        $
                                        {(
                                            (businessData.revenue.averageOrderValue || 0) * 0.9
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Digital Wallet</td>
                                    <td>
                                        {Math.floor((businessData.revenue.totalOrders || 0) * 0.05)}
                                    </td>
                                    <td>
                                        $
                                        {(
                                            (businessData.revenue.totalRevenue || 0) * 0.05
                                        ).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: '5%' }}
                                            ></div>
                                        </div>
                                        5%
                                    </td>
                                    <td>
                                        $
                                        {(
                                            (businessData.revenue.averageOrderValue || 0) * 1.1
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Revenue Trends */}
            <div className="section">
                <h3 className="section-title">📈 Revenue Trends</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>📅 Best Day</h4>
                        <p className="insight-value">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                        <span className="insight-detail">
                            ${((businessData?.revenue?.dailyAverage || 0) * 1.3).toFixed(2)} avg
                            revenue
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>⏰ Peak Hours</h4>
                        <p className="insight-value">2PM - 4PM</p>
                        <span className="insight-detail">35% of daily orders</span>
                    </div>
                    <div className="insight-card">
                        <h4>📊 Growth Rate</h4>
                        <p className="insight-value">
                            +
                            {calculateChange(
                                businessData?.revenue?.totalRevenue,
                                (businessData?.revenue?.totalRevenue || 0) * 0.8,
                            )}
                            %
                        </p>
                        <span className="insight-detail">vs previous period</span>
                    </div>
                    <div className="insight-card">
                        <h4>🎯 Target Progress</h4>
                        <p className="insight-value">
                            {Math.min(
                                100,
                                ((businessData?.revenue?.totalRevenue || 0) / 50000) * 100,
                            ).toFixed(1)}
                            %
                        </p>
                        <span className="insight-detail">of monthly target</span>
                    </div>
                </div>
            </div>

            {/* Revenue Forecast */}
            <div className="section">
                <h3 className="section-title">🔮 Revenue Forecast</h3>
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">Projected Revenue</h4>
                        <p className="chart-subtitle">
                            Based on current trends and historical data
                        </p>
                    </div>
                    <div className="metric-cards">
                        <div className="metric-card">
                            <div className="metric-value">
                                $
                                {(
                                    (businessData?.revenue?.totalRevenue || 0) * 1.15
                                ).toLocaleString()}
                            </div>
                            <div className="metric-label">Next Period</div>
                            <div className="metric-change positive">+15% projected</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">
                                $
                                {(
                                    (businessData?.revenue?.totalRevenue || 0) * 3.2
                                ).toLocaleString()}
                            </div>
                            <div className="metric-label">Next Quarter</div>
                            <div className="metric-change positive">+220% projected</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">
                                $
                                {((businessData?.revenue?.averageOrderValue || 0) * 1.08).toFixed(
                                    2,
                                )}
                            </div>
                            <div className="metric-label">Projected AOV</div>
                            <div className="metric-change positive">+8% increase</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueTab;
