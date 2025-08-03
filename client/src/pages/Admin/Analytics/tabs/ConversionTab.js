import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';
import StatsCard from '../../../../components/Admin/StatsCard/StatsCard';
import './TabStyles.css';

const ConversionTab = ({ dateRange, onDateRangeChange }) => {
    const [conversionData, setConversionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConversionData = async () => {
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

            const businessResponse = await API.get(
                `/api/analytics/business?startDate=${startDate.toISOString()}&endDate=${endDate}`,
            );

            setConversionData({
                business: businessResponse.data.data,
                dateRange: { start: startDate, end: new Date() },
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching conversion data:', err);
            setError('Failed to load conversion data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversionData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="loading-spinner"></div>
                <p>Loading conversion analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <h3>Error Loading Conversion Data</h3>
                <p>{error}</p>
                <button onClick={fetchConversionData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const businessData = conversionData?.business;
    const conversionMetrics = businessData?.conversion;
    const revenueData = businessData?.revenue;

    // Calculate funnel metrics
    const totalVisitors = 10000; // Simulated
    const productViews = Math.floor(totalVisitors * 0.65);
    const addToCarts = Math.floor(productViews * 0.25);
    const checkoutStarts = Math.floor(addToCarts * 0.7);
    const completedOrders = revenueData?.totalOrders || 0;

    const funnelSteps = [
        {
            name: 'Visitors',
            value: totalVisitors,
            percentage: 100,
            conversionRate: 100,
        },
        {
            name: 'Product Views',
            value: productViews,
            percentage: ((productViews / totalVisitors) * 100).toFixed(1),
            conversionRate: ((productViews / totalVisitors) * 100).toFixed(1),
        },
        {
            name: 'Add to Cart',
            value: addToCarts,
            percentage: ((addToCarts / totalVisitors) * 100).toFixed(1),
            conversionRate: ((addToCarts / productViews) * 100).toFixed(1),
        },
        {
            name: 'Checkout Started',
            value: checkoutStarts,
            percentage: ((checkoutStarts / totalVisitors) * 100).toFixed(1),
            conversionRate: ((checkoutStarts / addToCarts) * 100).toFixed(1),
        },
        {
            name: 'Purchase Completed',
            value: completedOrders,
            percentage: ((completedOrders / totalVisitors) * 100).toFixed(1),
            conversionRate: ((completedOrders / checkoutStarts) * 100).toFixed(1),
        },
    ];

    return (
        <div className="tab-content conversion-tab">
            {/* Tab Header */}
            <div className="tab-header">
                <h2 className="tab-title">🎯 Conversion Analytics</h2>
                <p className="tab-description">
                    Sales funnel analysis, conversion rates, and optimization opportunities
                </p>
            </div>

            {/* Conversion Overview */}
            <div className="section">
                <h3 className="section-title">📊 Conversion Overview</h3>
                <div className="stats-grid">
                    <StatsCard
                        title="Overall Conversion Rate"
                        value={`${conversionMetrics?.order_completed?.conversionRate || 0}%`}
                        icon="🎯"
                        color="success"
                        subtitle="Visitors to customers"
                    />
                    <StatsCard
                        title="Cart Conversion Rate"
                        value={`${((completedOrders / addToCarts) * 100).toFixed(1)}%`}
                        icon="🛒"
                        color="info"
                        subtitle="Cart to purchase"
                    />
                    <StatsCard
                        title="Checkout Completion"
                        value={`${((completedOrders / checkoutStarts) * 100).toFixed(1)}%`}
                        icon="✅"
                        color="warning"
                        subtitle="Checkout to order"
                    />
                    <StatsCard
                        title="Product View Rate"
                        value={`${((productViews / totalVisitors) * 100).toFixed(1)}%`}
                        icon="👁️"
                        color="primary"
                        subtitle="Visitors to product page"
                    />
                </div>
            </div>

            {/* Conversion Funnel */}
            <div className="section">
                <h3 className="section-title">🔄 Conversion Funnel</h3>
                <div className="chart-container">
                    <div className="funnel-visualization">
                        {funnelSteps.map((step, index) => (
                            <div key={index} className="funnel-step">
                                <div className="funnel-step-header">
                                    <h4>{step.name}</h4>
                                    <span className="funnel-conversion-rate">
                                        {index > 0 && `${step.conversionRate}% conversion`}
                                    </span>
                                </div>
                                <div className="funnel-bar-container">
                                    <div
                                        className="funnel-bar"
                                        style={{
                                            width: `${step.percentage}%`,
                                            background: `linear-gradient(135deg, 
                                                hsl(${220 - index * 20}, 70%, ${
                                                60 + index * 5
                                            }%) 0%, 
                                                hsl(${200 - index * 15}, 65%, ${
                                                50 + index * 8
                                            }%) 100%)`,
                                        }}
                                    >
                                        <span className="funnel-value">
                                            {step.value.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="funnel-metrics">
                                    <span className="funnel-percentage">
                                        {step.percentage}% of total
                                    </span>
                                    {index > 0 && (
                                        <span className="funnel-dropoff">
                                            -
                                            {(
                                                funnelSteps[index - 1].value - step.value
                                            ).toLocaleString()}{' '}
                                            lost
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversion by Source */}
            <div className="section">
                <h3 className="section-title">📈 Conversion by Traffic Source</h3>
                <div className="chart-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Traffic Source</th>
                                <th>Visitors</th>
                                <th>Conversions</th>
                                <th>Conversion Rate</th>
                                <th>Revenue</th>
                                <th>ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Organic Search</td>
                                <td>3,500</td>
                                <td>{Math.floor(completedOrders * 0.35)}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: '4.2%' }}
                                        ></div>
                                    </div>
                                    4.2%
                                </td>
                                <td>
                                    ${((revenueData?.totalRevenue || 0) * 0.35).toLocaleString()}
                                </td>
                                <td className="metric-change positive">520%</td>
                            </tr>
                            <tr>
                                <td>Direct Traffic</td>
                                <td>2,800</td>
                                <td>{Math.floor(completedOrders * 0.4)}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: '6.8%' }}
                                        ></div>
                                    </div>
                                    6.8%
                                </td>
                                <td>
                                    ${((revenueData?.totalRevenue || 0) * 0.4).toLocaleString()}
                                </td>
                                <td className="metric-change positive">680%</td>
                            </tr>
                            <tr>
                                <td>Social Media</td>
                                <td>1,800</td>
                                <td>{Math.floor(completedOrders * 0.15)}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: '2.1%' }}
                                        ></div>
                                    </div>
                                    2.1%
                                </td>
                                <td>
                                    ${((revenueData?.totalRevenue || 0) * 0.15).toLocaleString()}
                                </td>
                                <td className="metric-change positive">210%</td>
                            </tr>
                            <tr>
                                <td>Paid Search</td>
                                <td>1,200</td>
                                <td>{Math.floor(completedOrders * 0.08)}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: '3.5%' }}
                                        ></div>
                                    </div>
                                    3.5%
                                </td>
                                <td>
                                    ${((revenueData?.totalRevenue || 0) * 0.08).toLocaleString()}
                                </td>
                                <td className="metric-change neutral">150%</td>
                            </tr>
                            <tr>
                                <td>Email Marketing</td>
                                <td>600</td>
                                <td>{Math.floor(completedOrders * 0.02)}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: '8.5%' }}
                                        ></div>
                                    </div>
                                    8.5%
                                </td>
                                <td>
                                    ${((revenueData?.totalRevenue || 0) * 0.02).toLocaleString()}
                                </td>
                                <td className="metric-change positive">850%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conversion Optimization Opportunities */}
            <div className="section">
                <h3 className="section-title">🚀 Optimization Opportunities</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>🛒 Cart Abandonment</h4>
                        <p className="insight-value">
                            {(((addToCarts - checkoutStarts) / addToCarts) * 100).toFixed(1)}%
                        </p>
                        <span className="insight-detail">
                            {(addToCarts - checkoutStarts).toLocaleString()} potential sales lost
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>💳 Checkout Abandonment</h4>
                        <p className="insight-value">
                            {(((checkoutStarts - completedOrders) / checkoutStarts) * 100).toFixed(
                                1,
                            )}
                            %
                        </p>
                        <span className="insight-detail">
                            {(checkoutStarts - completedOrders).toLocaleString()} checkouts
                            incomplete
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>📱 Mobile Conversion</h4>
                        <p className="insight-value">3.2%</p>
                        <span className="insight-detail">Below desktop average</span>
                    </div>
                    <div className="insight-card">
                        <h4>⏱️ Page Load Impact</h4>
                        <p className="insight-value">-15%</p>
                        <span className="insight-detail">Slow pages reduce conversion</span>
                    </div>
                </div>
            </div>

            {/* Conversion Trends */}
            <div className="section">
                <h3 className="section-title">📈 Conversion Trends</h3>
                <div className="metric-cards">
                    <div className="metric-card">
                        <div className="metric-value">Monday</div>
                        <div className="metric-label">Best Converting Day</div>
                        <div className="metric-change positive">6.8% conversion rate</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">2-4 PM</div>
                        <div className="metric-label">Peak Conversion Hours</div>
                        <div className="metric-change positive">8.2% conversion rate</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">+12%</div>
                        <div className="metric-label">Monthly Growth</div>
                        <div className="metric-change positive">vs last month</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">$85</div>
                        <div className="metric-label">Cost Per Conversion</div>
                        <div className="metric-change negative">-8% vs last month</div>
                    </div>
                </div>
            </div>

            {/* Micro-Conversions */}
            <div className="section">
                <h3 className="section-title">🎯 Micro-Conversions</h3>
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">Supporting Conversion Metrics</h4>
                        <p className="chart-subtitle">Secondary actions that lead to purchases</p>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Users</th>
                                <th>Conversion Rate</th>
                                <th>Impact on Purchase</th>
                                <th>Optimization Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Newsletter Signup</td>
                                <td>1,250</td>
                                <td>12.5%</td>
                                <td>+35% likely to purchase</td>
                                <td className="metric-change positive">High</td>
                            </tr>
                            <tr>
                                <td>Account Creation</td>
                                <td>850</td>
                                <td>8.5%</td>
                                <td>+55% likely to purchase</td>
                                <td className="metric-change positive">High</td>
                            </tr>
                            <tr>
                                <td>Wishlist Addition</td>
                                <td>620</td>
                                <td>6.2%</td>
                                <td>+25% likely to purchase</td>
                                <td className="metric-change neutral">Medium</td>
                            </tr>
                            <tr>
                                <td>Product Comparison</td>
                                <td>340</td>
                                <td>3.4%</td>
                                <td>+45% likely to purchase</td>
                                <td className="metric-change positive">High</td>
                            </tr>
                            <tr>
                                <td>Reviews Read</td>
                                <td>2,100</td>
                                <td>21.0%</td>
                                <td>+20% likely to purchase</td>
                                <td className="metric-change neutral">Medium</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConversionTab;
