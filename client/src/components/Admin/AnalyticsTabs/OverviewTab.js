import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import { useI18n } from '../../../hooks/useI18n';

const OverviewTab = ({ analyticsData, realTimeData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;

    return (
        <div className="overview-tab">
            {/* Real-Time Stats */}
            {realTimeData && (
                <div className="realtime-section">
                    <h2>{t('analytics.sections.realTimeActivity')}</h2>
                    <div className="realtime-grid">
                        <div className="realtime-card">
                            <h3>{realTimeData.activeUsers}</h3>
                            <p>{t('analytics.metrics.activeUsers')}</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.todayEvents}</h3>
                            <p>Events {t('analytics.time.today')}</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.recentSignups}</h3>
                            <p>New Signups</p>
                        </div>
                        <div className="realtime-card">
                            <h3>{realTimeData.recentOrders?.length || 0}</h3>
                            <p>{t('analytics.sections.recentOrders')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics Overview */}
            {businessData && (
                <div className="key-metrics-section">
                    <h2>{t('analytics.sections.keyMetrics')}</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title={t('analytics.metrics.totalRevenue')}
                            value={`${businessData.revenue?.totalRevenue?.toLocaleString() || 0}đ`}
                            icon="💰"
                            color="success"
                        />
                        <StatsCard
                            title={t('analytics.metrics.totalOrders')}
                            value={businessData.revenue?.totalOrders || 0}
                            icon="📦"
                            color="primary"
                        />
                        <StatsCard
                            title={t('analytics.metrics.totalCustomers')}
                            value={businessData.customers?.totalCustomers || 0}
                            icon="👥"
                            color="info"
                        />
                    </div>
                </div>
            )}

            {/* Quick Insights */}
            <div className="quick-insights-section">
                <h2>{t('analytics.sections.quickInsights')}</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>📈 {t('analytics.insights.revenueTrend')}</h3>
                        <p>
                            {businessData?.revenue?.totalRevenue > 0
                                ? `${t('analytics.insights.growingRevenue')} ${dateRange.replace(
                                      'days',
                                      ` ${t('analytics.insights.days')}`,
                                  )}`
                                : t('analytics.messages.noRevenueData')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>🛒 {t('analytics.insights.orderPerformance')}</h3>
                        <p>
                            {businessData?.revenue?.averageOrderValue
                                ? `${t(
                                      'analytics.insights.averageOrderValue',
                                  )} ${businessData.revenue.averageOrderValue.toFixed(0)}đ`
                                : t('analytics.messages.noOrderData')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>👤 {t('analytics.insights.customerInsights')}</h3>
                        <p>
                            {businessData?.customers?.retention?.retentionRate
                                ? `${t('analytics.insights.customerRetentionRate')} ${
                                      businessData.customers.retention.retentionRate
                                  }%`
                                : t('analytics.messages.buildingCustomerBase')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
