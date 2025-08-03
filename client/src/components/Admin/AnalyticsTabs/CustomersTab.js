import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import {
    formatCurrency,
    calculatePercentage,
    calculateCustomerHealthScore,
    getTopPerformer,
} from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';
import { useI18n } from '../../../hooks/useI18n';

const CustomersTab = ({ analyticsData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;
    const customersData = businessData?.customers;

    // Calculate improved customer health score using utility function
    const healthScore = calculateCustomerHealthScore(
        customersData?.retention?.retentionRate || 0,
        customersData?.behaviorPatterns?.repeatPurchaseRate || 0,
        customersData?.behaviorPatterns?.averageOrderFrequency || 0,
    );

    return (
        <div className="customers-tab">
            {/* Customer Overview */}
            {customersData && (
                <div className="customer-overview-section">
                    <h2>Customer Overview</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title="New Customers"
                            value={customersData.newCustomers || 0}
                            icon="👥"
                            color="success"
                        />
                        <StatsCard
                            title="Total Customers"
                            value={customersData.totalCustomers || 0}
                            icon="👤"
                            color="primary"
                        />
                        <StatsCard
                            title="Retention Rate"
                            value={`${customersData.retention?.retentionRate || 0}%`}
                            icon="🔄"
                            color="info"
                        />
                        <StatsCard
                            title="Avg Lifetime Value"
                            value={formatCurrency(
                                customersData.lifetimeValue?.averageLifetimeValue || 0,
                            )}
                            icon="💎"
                            color="warning"
                        />
                    </div>
                </div>
            )}

            {/* Customer Acquisition */}
            <div className="customer-acquisition-section">
                <h2>Customer Acquisition</h2>
                <div className="acquisition-grid">
                    <div className="acquisition-card">
                        <h3>📈 Acquisition Channels</h3>
                        <div className="channel-list">
                            {customersData?.acquisitionChannels?.map((channel) => {
                                const percentage = calculatePercentage(
                                    channel.count,
                                    customersData.newCustomers,
                                );
                                const channelConfig =
                                    CONFIG.channels[channel._id] || CONFIG.channels.default;

                                return (
                                    <div key={channel._id} className="channel-item">
                                        <span className="channel-name">
                                            {channelConfig.icon} {channelConfig.label}
                                        </span>
                                        <span className="channel-percentage">{percentage}%</span>
                                        <span className="channel-count">
                                            {channel.count} customers
                                        </span>
                                    </div>
                                );
                            }) || (
                                <div className="channel-item">
                                    <span className="channel-name">No data available</span>
                                    <span className="channel-percentage">0%</span>
                                    <span className="channel-count">0 customers</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="acquisition-card">
                        <h3>🎯 Customer Demographics</h3>
                        <div className="demographics-list">
                            {customersData?.demographics?.map((demo) => {
                                const totalDemographics = customersData.demographics.reduce(
                                    (sum, d) => sum + d.count,
                                    0,
                                );
                                const percentage = calculatePercentage(
                                    demo.count,
                                    totalDemographics,
                                );

                                return (
                                    <div key={demo._id} className="demo-item">
                                        <span className="demo-label">Age {demo._id}</span>
                                        <div className="demo-bar">
                                            <div
                                                className="demo-fill"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="demo-percentage">{percentage}%</span>
                                    </div>
                                );
                            }) || (
                                <div className="demo-item">
                                    <span className="demo-label">No demographic data</span>
                                    <div className="demo-bar">
                                        <div className="demo-fill" style={{ width: '0%' }}></div>
                                    </div>
                                    <span className="demo-percentage">0%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Behavior */}
            <div className="customer-behavior-section">
                <h2>{t('analytics.sections.customerBehavior')}</h2>
                <div className="behavior-grid">
                    <div className="behavior-card">
                        <h3>🛒 {t('analytics.purchasePatterns.purchasePatterns')}</h3>
                        <div className="pattern-stats">
                            <div className="pattern-item">
                                <span className="pattern-label">
                                    {t('analytics.purchasePatterns.averageOrderFrequency')}
                                </span>
                                <span className="pattern-value">
                                    {(
                                        customersData?.behaviorPatterns?.averageOrderFrequency || 0
                                    ).toFixed(1)}{' '}
                                    {t('analytics.labels.ordersMonth')}
                                </span>
                            </div>
                            <div className="pattern-item">
                                <span className="pattern-label">
                                    {t('analytics.purchasePatterns.repeatPurchaseRate')}
                                </span>
                                <span className="pattern-value">
                                    {(
                                        (customersData?.behaviorPatterns?.repeatPurchaseRate || 0) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </span>
                            </div>
                            <div className="pattern-item">
                                <span className="pattern-label">
                                    {t('analytics.purchasePatterns.timeBetweenOrders')}
                                </span>
                                <span className="pattern-value">
                                    {Math.round(
                                        customersData?.behaviorPatterns?.averageDaysBetweenOrders ||
                                            0,
                                    )}{' '}
                                    {t('analytics.labels.daysAvg')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="behavior-card">
                        <h3>⭐ {t('analytics.customerHealthScore.customerHealthScore')}</h3>
                        <div className="satisfaction-stats">
                            <div className="health-metric">
                                <span className="metric-label">
                                    {t('analytics.customerHealthScore.retentionRate')}
                                </span>
                                <span className="metric-value">
                                    {customersData?.retention?.retentionRate?.toFixed(1) || 0}%
                                </span>
                            </div>
                            <div className="health-metric">
                                <span className="metric-label">
                                    {t('analytics.customerHealthScore.repeatPurchaseRate')}
                                </span>
                                <span className="metric-value">
                                    {(
                                        (customersData?.behaviorPatterns?.repeatPurchaseRate || 0) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </span>
                            </div>
                            <div className="health-metric">
                                <span className="metric-label">
                                    {t('analytics.customerHealthScore.orderFrequency')}
                                </span>
                                <span className="metric-value">
                                    {(
                                        customersData?.behaviorPatterns?.averageOrderFrequency || 0
                                    ).toFixed(1)}{' '}
                                    {t('analytics.labels.ordersMonth')}
                                </span>
                            </div>
                        </div>
                        <div className="health-score">
                            <span className="score-value">{healthScore}</span>
                            <span className="score-label">{t('analytics.labels.healthScore')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Segments */}
            <div className="customer-segments-section">
                <h2>{t('analytics.sections.customerSegments')}</h2>
                <div className="segments-grid">
                    {Object.entries(CONFIG.segments).map(([segmentKey, segmentConfig]) => {
                        let count = 0;
                        let percentage = 0;
                        let totalForPercentage = 1;

                        // Map segment keys to customer data
                        switch (segmentKey) {
                            case 'vip':
                                count = customersData?.customerSegments?.vipCustomers || 0;
                                totalForPercentage =
                                    customersData?.customerSegments?.totalCustomersWithOrders || 1;
                                break;
                            case 'loyal':
                                count = customersData?.customerSegments?.loyalCustomers || 0;
                                totalForPercentage =
                                    customersData?.customerSegments?.totalCustomersWithOrders || 1;
                                break;
                            case 'regular':
                                count = customersData?.customerSegments?.regularCustomers || 0;
                                totalForPercentage =
                                    customersData?.customerSegments?.totalCustomersWithOrders || 1;
                                break;
                            case 'new':
                                count = customersData?.newCustomers || 0;
                                totalForPercentage = customersData?.totalCustomers || 1;
                                break;
                            default:
                                count = 0;
                        }

                        percentage = calculatePercentage(count, totalForPercentage);

                        return (
                            <div
                                key={segmentKey}
                                className={`segment-card ${segmentConfig.className}`}
                            >
                                <h3>
                                    {segmentConfig.icon} {segmentConfig.label}
                                </h3>
                                <div className="segment-stats">
                                    <span className="segment-count">
                                        {count} {t('analytics.labels.customers')}
                                    </span>
                                    <span className="segment-percentage">{percentage}%</span>
                                </div>
                                <div className="segment-criteria">
                                    <p>• {segmentConfig.criteria}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Customer Insights */}
            <div className="customer-insights-section">
                <h2>{t('analytics.sections.customerInsights')}</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>📊 {t('analytics.insights.customerGrowth')}</h3>
                        <p>
                            {customersData?.newCustomers > 0
                                ? `${customersData.newCustomers} ${t(
                                      'analytics.insights.newCustomersAcquired',
                                  )}`
                                : t('analytics.messages.noNewCustomers')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>🎯 {t('analytics.insights.topChannel')}</h3>
                        <p>
                            {getTopPerformer(customersData?.acquisitionChannels, 'count', '_id')
                                ? `${
                                      CONFIG.channels[
                                          getTopPerformer(
                                              customersData.acquisitionChannels,
                                              'count',
                                              '_id',
                                          )
                                      ]?.label || 'Unknown'
                                  } ${t('analytics.insights.topAcquisitionChannel')}`
                                : t('analytics.messages.analyzingAcquisitionChannels')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>💡 {t('analytics.insights.customerValue')}</h3>
                        <p>
                            {customersData?.lifetimeValue?.averageLifetimeValue > 0
                                ? `${t(
                                      'analytics.insights.averageCustomerLifetimeValue',
                                  )} ${formatCurrency(
                                      customersData.lifetimeValue.averageLifetimeValue,
                                  )}`
                                : t('analytics.messages.buildingCustomerValueMetrics')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomersTab;
