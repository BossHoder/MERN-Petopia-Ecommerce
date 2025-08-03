import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';
import StatsCard from '../../../../components/Admin/StatsCard/StatsCard';
import './TabStyles.css';

const MarketingTab = ({ dateRange, onDateRangeChange }) => {
    const [marketingData, setMarketingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMarketingData = async () => {
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

            // Simulate marketing data
            const totalRevenue = businessResponse.data.data?.revenue?.totalRevenue || 0;
            const totalOrders = businessResponse.data.data?.revenue?.totalOrders || 0;

            const simulatedMarketing = {
                totalSpend: totalRevenue * 0.12, // 12% marketing spend
                roi: (((totalRevenue - totalRevenue * 0.12) / (totalRevenue * 0.12)) * 100).toFixed(
                    1,
                ),
                campaigns: [
                    {
                        name: 'Spring Pet Collection',
                        type: 'Google Ads',
                        spend: totalRevenue * 0.04,
                        revenue: totalRevenue * 0.18,
                        clicks: 2500,
                        conversions: Math.floor(totalOrders * 0.25),
                        status: 'Active',
                    },
                    {
                        name: 'Facebook Pet Parents',
                        type: 'Facebook Ads',
                        spend: totalRevenue * 0.03,
                        revenue: totalRevenue * 0.12,
                        clicks: 1800,
                        conversions: Math.floor(totalOrders * 0.15),
                        status: 'Active',
                    },
                    {
                        name: 'Instagram Stories',
                        type: 'Instagram Ads',
                        spend: totalRevenue * 0.025,
                        revenue: totalRevenue * 0.08,
                        clicks: 1200,
                        conversions: Math.floor(totalOrders * 0.1),
                        status: 'Active',
                    },
                    {
                        name: 'Email Newsletter',
                        type: 'Email Marketing',
                        spend: totalRevenue * 0.01,
                        revenue: totalRevenue * 0.06,
                        clicks: 950,
                        conversions: Math.floor(totalOrders * 0.08),
                        status: 'Active',
                    },
                ],
            };

            setMarketingData({
                business: businessResponse.data.data,
                marketing: simulatedMarketing,
                dateRange: { start: startDate, end: new Date() },
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching marketing data:', err);
            setError('Failed to load marketing data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketingData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="loading-spinner"></div>
                <p>Loading marketing analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <h3>Error Loading Marketing Data</h3>
                <p>{error}</p>
                <button onClick={fetchMarketingData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const businessData = marketingData?.business;
    const marketingMetrics = marketingData?.marketing;
    const revenueData = businessData?.revenue;

    return (
        <div className="tab-content marketing-tab">
            {/* Tab Header */}
            <div className="tab-header">
                <h2 className="tab-title">📢 Marketing Analytics</h2>
                <p className="tab-description">
                    Campaign performance, marketing ROI, and advertising effectiveness across
                    channels
                </p>
            </div>

            {/* Marketing Overview */}
            {marketingMetrics && (
                <div className="section">
                    <h3 className="section-title">📊 Marketing Overview</h3>
                    <div className="stats-grid">
                        <StatsCard
                            title="Total Marketing Spend"
                            value={`$${marketingMetrics.totalSpend.toLocaleString()}`}
                            icon="💰"
                            color="warning"
                            subtitle="All channels combined"
                        />
                        <StatsCard
                            title="Marketing ROI"
                            value={`${marketingMetrics.roi}%`}
                            icon="📈"
                            color="success"
                            subtitle="Return on investment"
                        />
                        <StatsCard
                            title="Cost Per Acquisition"
                            value={`$${(
                                marketingMetrics.totalSpend / (revenueData?.totalOrders || 1)
                            ).toFixed(2)}`}
                            icon="🎯"
                            color="info"
                            subtitle="Per new customer"
                        />
                        <StatsCard
                            title="Marketing Attribution"
                            value={`${(
                                (marketingMetrics.totalSpend / (revenueData?.totalRevenue || 1)) *
                                100
                            ).toFixed(1)}%`}
                            icon="📊"
                            color="primary"
                            subtitle="Of total revenue"
                        />
                    </div>
                </div>
            )}

            {/* Campaign Performance */}
            {marketingMetrics?.campaigns && (
                <div className="section">
                    <h3 className="section-title">🚀 Campaign Performance</h3>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Type</th>
                                    <th>Spend</th>
                                    <th>Revenue</th>
                                    <th>ROI</th>
                                    <th>Conversions</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketingMetrics.campaigns.map((campaign, index) => {
                                    const roi = (
                                        ((campaign.revenue - campaign.spend) / campaign.spend) *
                                        100
                                    ).toFixed(1);
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="campaign-info">
                                                    <strong>{campaign.name}</strong>
                                                    <small>
                                                        {campaign.clicks.toLocaleString()} clicks
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`campaign-type ${campaign.type
                                                        .toLowerCase()
                                                        .replace(' ', '-')}`}
                                                >
                                                    {campaign.type}
                                                </span>
                                            </td>
                                            <td>${campaign.spend.toLocaleString()}</td>
                                            <td>${campaign.revenue.toLocaleString()}</td>
                                            <td>
                                                <span
                                                    className={`roi-value ${
                                                        roi > 200
                                                            ? 'high'
                                                            : roi > 100
                                                            ? 'medium'
                                                            : 'low'
                                                    }`}
                                                >
                                                    {roi}%
                                                </span>
                                            </td>
                                            <td>{campaign.conversions}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${campaign.status.toLowerCase()}`}
                                                >
                                                    {campaign.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Channel Performance */}
            <div className="section">
                <h3 className="section-title">📺 Channel Performance</h3>
                <div className="metric-cards">
                    <div className="metric-card">
                        <div className="metric-value">
                            ${((marketingMetrics?.totalSpend || 0) * 0.45).toLocaleString()}
                        </div>
                        <div className="metric-label">Paid Search</div>
                        <div className="metric-change positive">
                            {(
                                (((marketingMetrics?.totalSpend || 0) * 0.45) /
                                    (marketingMetrics?.totalSpend || 1)) *
                                100
                            ).toFixed(0)}
                            % of budget
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            ${((marketingMetrics?.totalSpend || 0) * 0.3).toLocaleString()}
                        </div>
                        <div className="metric-label">Social Media</div>
                        <div className="metric-change positive">
                            {(
                                (((marketingMetrics?.totalSpend || 0) * 0.3) /
                                    (marketingMetrics?.totalSpend || 1)) *
                                100
                            ).toFixed(0)}
                            % of budget
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            ${((marketingMetrics?.totalSpend || 0) * 0.15).toLocaleString()}
                        </div>
                        <div className="metric-label">Email Marketing</div>
                        <div className="metric-change positive">
                            {(
                                (((marketingMetrics?.totalSpend || 0) * 0.15) /
                                    (marketingMetrics?.totalSpend || 1)) *
                                100
                            ).toFixed(0)}
                            % of budget
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            ${((marketingMetrics?.totalSpend || 0) * 0.1).toLocaleString()}
                        </div>
                        <div className="metric-label">Content Marketing</div>
                        <div className="metric-change neutral">
                            {(
                                (((marketingMetrics?.totalSpend || 0) * 0.1) /
                                    (marketingMetrics?.totalSpend || 1)) *
                                100
                            ).toFixed(0)}
                            % of budget
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketing Funnel */}
            <div className="section">
                <h3 className="section-title">🔄 Marketing Funnel</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>👁️ Impressions</h4>
                        <p className="insight-value">
                            {(
                                marketingMetrics?.campaigns.reduce((sum, c) => sum + c.clicks, 0) *
                                15
                            ).toLocaleString()}
                        </p>
                        <span className="insight-detail">Total ad impressions</span>
                    </div>
                    <div className="insight-card">
                        <h4>🖱️ Clicks</h4>
                        <p className="insight-value">
                            {marketingMetrics?.campaigns
                                .reduce((sum, c) => sum + c.clicks, 0)
                                .toLocaleString()}
                        </p>
                        <span className="insight-detail">Click-through rate: 4.2%</span>
                    </div>
                    <div className="insight-card">
                        <h4>🎯 Leads</h4>
                        <p className="insight-value">
                            {Math.floor(
                                marketingMetrics?.campaigns.reduce((sum, c) => sum + c.clicks, 0) *
                                    0.15,
                            )}
                        </p>
                        <span className="insight-detail">Lead conversion: 15%</span>
                    </div>
                    <div className="insight-card">
                        <h4>💰 Sales</h4>
                        <p className="insight-value">
                            {marketingMetrics?.campaigns.reduce((sum, c) => sum + c.conversions, 0)}
                        </p>
                        <span className="insight-detail">Sales conversion: 3.2%</span>
                    </div>
                </div>
            </div>

            {/* Top Performing Keywords */}
            <div className="section">
                <h3 className="section-title">🔍 Top Performing Keywords</h3>
                <div className="chart-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Keyword</th>
                                <th>Impressions</th>
                                <th>Clicks</th>
                                <th>CTR</th>
                                <th>CPC</th>
                                <th>Conversions</th>
                                <th>Cost/Conv</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>pet food online</strong>
                                </td>
                                <td>15,240</td>
                                <td>650</td>
                                <td>4.3%</td>
                                <td>$1.25</td>
                                <td>28</td>
                                <td>$29.02</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>dog toys</strong>
                                </td>
                                <td>12,890</td>
                                <td>580</td>
                                <td>4.5%</td>
                                <td>$0.95</td>
                                <td>35</td>
                                <td>$15.77</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>cat supplies</strong>
                                </td>
                                <td>9,456</td>
                                <td>420</td>
                                <td>4.4%</td>
                                <td>$1.10</td>
                                <td>22</td>
                                <td>$21.00</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>pet accessories</strong>
                                </td>
                                <td>8,750</td>
                                <td>385</td>
                                <td>4.4%</td>
                                <td>$1.35</td>
                                <td>18</td>
                                <td>$28.92</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>premium pet food</strong>
                                </td>
                                <td>6,234</td>
                                <td>320</td>
                                <td>5.1%</td>
                                <td>$2.20</td>
                                <td>25</td>
                                <td>$28.16</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Marketing Performance */}
            <div className="section">
                <h3 className="section-title">📧 Email Marketing Performance</h3>
                <div className="metric-cards">
                    <div className="metric-card">
                        <div className="metric-value">12,450</div>
                        <div className="metric-label">Subscribers</div>
                        <div className="metric-change positive">+8% this month</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">24.5%</div>
                        <div className="metric-label">Open Rate</div>
                        <div className="metric-change positive">Above average</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">3.8%</div>
                        <div className="metric-label">Click Rate</div>
                        <div className="metric-change positive">Industry leading</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">0.8%</div>
                        <div className="metric-label">Unsubscribe Rate</div>
                        <div className="metric-change positive">Very low</div>
                    </div>
                </div>
            </div>

            {/* Marketing Optimization */}
            <div className="section">
                <h3 className="section-title">⚡ Optimization Opportunities</h3>
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">Improvement Recommendations</h4>
                        <p className="chart-subtitle">
                            Data-driven suggestions to enhance marketing performance
                        </p>
                    </div>
                    <div className="optimization-list">
                        <div className="optimization-item">
                            <div className="optimization-priority high">High</div>
                            <div className="optimization-content">
                                <h5>Increase Facebook Campaign Budget</h5>
                                <p>
                                    Current ROI of 300% suggests room for scaling. Recommended
                                    budget increase: +40%
                                </p>
                                <span className="potential-impact">
                                    Potential revenue increase: +$8,500
                                </span>
                            </div>
                        </div>
                        <div className="optimization-item">
                            <div className="optimization-priority medium">Medium</div>
                            <div className="optimization-content">
                                <h5>Optimize Google Ads Keywords</h5>
                                <p>
                                    Some keywords have high CPC but low conversion. Consider pausing
                                    or bid adjustment.
                                </p>
                                <span className="potential-impact">
                                    Potential cost savings: -$2,200
                                </span>
                            </div>
                        </div>
                        <div className="optimization-item">
                            <div className="optimization-priority medium">Medium</div>
                            <div className="optimization-content">
                                <h5>Expand Email Segmentation</h5>
                                <p>Segment subscribers by pet type for more targeted campaigns.</p>
                                <span className="potential-impact">
                                    Potential CTR increase: +25%
                                </span>
                            </div>
                        </div>
                        <div className="optimization-item">
                            <div className="optimization-priority low">Low</div>
                            <div className="optimization-content">
                                <h5>Test Instagram Shopping Ads</h5>
                                <p>
                                    Visual products perform well on Instagram. Consider product
                                    catalog ads.
                                </p>
                                <span className="potential-impact">
                                    Potential new revenue channel
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingTab;
