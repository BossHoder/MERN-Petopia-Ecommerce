import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import { useI18n } from '../../../hooks/useI18n';
import {
    formatCurrency,
    calculatePercentage,
    calculateFulfillmentRate,
    getOrderStatusCount,
    calculateAverage,
} from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';

const OrdersTab = ({ analyticsData, realTimeData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;
    const revenueData = businessData?.revenue;

    // Calculate order metrics
    const totalOrders = revenueData?.totalOrders || 0;
    const orderStatusBreakdown = revenueData?.orderStatusBreakdown || [];
    const completedOrders = getOrderStatusCount(orderStatusBreakdown, 'completed');
    const deliveredOrders = getOrderStatusCount(orderStatusBreakdown, 'delivered');
    const pendingOrders = getOrderStatusCount(orderStatusBreakdown, 'pending');
    const cancelledOrders = getOrderStatusCount(orderStatusBreakdown, 'cancelled');

    // Calculate fulfillment rate properly
    const fulfillmentRate = calculateFulfillmentRate(orderStatusBreakdown, totalOrders);

    return (
        <div className="orders-tab">
            {/* Order Statistics */}
            {revenueData && (
                <div className="order-stats-section">
                    <h2>{t('analytics.sections.orderStatistics')}</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title={t('analytics.metrics.totalOrders')}
                            value={revenueData.totalOrders || 0}
                            icon="📦"
                            color="primary"
                        />
                        <StatsCard
                            title={t('analytics.metrics.completedOrders')}
                            value={completedOrders + deliveredOrders}
                            icon="✅"
                            color="success"
                        />
                        <StatsCard
                            title={t('analytics.metrics.pendingOrders')}
                            value={pendingOrders}
                            icon="⏳"
                            color="warning"
                        />
                        <StatsCard
                            title={t('analytics.metrics.cancelledOrders')}
                            value={cancelledOrders}
                            icon="❌"
                            color="danger"
                        />
                    </div>
                </div>
            )}

            {/* Order Performance Metrics */}
            <div className="order-performance-section">
                <h2>{t('analytics.sections.orderPerformance')}</h2>
                <div className="performance-grid">
                    <div className="performance-card">
                        <h3>{t('analytics.metrics.averageOrderValue')}</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">
                                    {formatCurrency(revenueData?.averageOrderValue || 0)}
                                </span>
                                <span className="metric-label">
                                    {t('analytics.labels.perOrder')}
                                </span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        (revenueData?.averageOrderValue || 0) >=
                                        CONFIG.targets.averageOrderValue
                                            ? 'positive'
                                            : 'neutral'
                                    }`}
                                >
                                    {(revenueData?.averageOrderValue || 0) >=
                                    CONFIG.targets.averageOrderValue
                                        ? `↗ ${t('analytics.status.aboveTarget')}`
                                        : `→ ${t('analytics.status.belowTarget')}`}
                                </span>
                                <span className="trend-label">vs target AOV</span>
                            </div>
                        </div>
                    </div>

                    <div className="performance-card">
                        <h3>{t('analytics.metrics.orderFrequency')}</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">
                                    {calculateAverage(totalOrders, 30, 'day').toFixed(1)}
                                </span>
                                <span className="metric-label">{t('analytics.labels.perDay')}</span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        totalOrders > 0 ? 'positive' : 'neutral'
                                    }`}
                                >
                                    {totalOrders > 0
                                        ? `↗ ${t('analytics.status.active')}`
                                        : `→ ${t('analytics.status.building')}`}
                                </span>
                                <span className="trend-label">order activity</span>
                            </div>
                        </div>
                    </div>

                    <div className="performance-card">
                        <h3>{t('analytics.metrics.fulfillmentRate')}</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">{fulfillmentRate}%</span>
                                <span className="metric-label">
                                    {t('analytics.labels.completedRate')}
                                </span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        fulfillmentRate >= 80
                                            ? 'positive'
                                            : fulfillmentRate >= 60
                                            ? 'neutral'
                                            : 'negative'
                                    }`}
                                >
                                    {fulfillmentRate >= 80
                                        ? `↗ ${t('analytics.status.excellent')}`
                                        : fulfillmentRate >= 60
                                        ? `→ ${t('analytics.status.good')}`
                                        : `↓ ${t('analytics.status.needsImprovement')}`}
                                </span>
                                <span className="trend-label">fulfillment performance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="order-status-section">
                <h2>{t('analytics.sections.orderStatusBreakdown')}</h2>
                <div className="status-grid">
                    {orderStatusBreakdown?.map((status) => {
                        const percentage = calculatePercentage(status.count, totalOrders);
                        const config = CONFIG.statuses[status._id] || CONFIG.statuses.default;

                        return (
                            <div key={status._id} className="status-card">
                                <div className="status-header">
                                    <h3>
                                        {config.icon} {config.label}
                                    </h3>
                                    <span className="status-count">{status.count}</span>
                                </div>
                                <div className="status-progress">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${config.className}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="status-percentage">{percentage}%</span>
                                </div>
                            </div>
                        );
                    }) || (
                        <div className="status-card">
                            <div className="status-header">
                                <h3>📋 No Data</h3>
                                <span className="status-count">0</span>
                            </div>
                            <div className="status-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                                <span className="status-percentage">0%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            {realTimeData?.recentOrders && (
                <div className="recent-orders-section">
                    <h2>{t('analytics.sections.recentOrders')}</h2>
                    <div className="orders-table">
                        <div className="table-header">
                            <span>Order ID</span>
                            <span>{t('analytics.labels.customer')}</span>
                            <span>{t('analytics.labels.amount')}</span>
                            <span>{t('analytics.labels.status')}</span>
                            <span>{t('analytics.labels.date')}</span>
                        </div>
                        {realTimeData.recentOrders.slice(0, 5).map((order) => {
                            const statusConfig =
                                CONFIG.statuses[order.orderStatus] || CONFIG.statuses.default;

                            return (
                                <div key={order._id} className="table-row">
                                    <span className="order-id">#{order.orderNumber}</span>
                                    <span className="customer-name">
                                        {order.user?.name || 'Guest'}
                                    </span>
                                    <span className="order-amount">
                                        {formatCurrency(order.totalPrice || 0)}
                                    </span>
                                    <span className={`order-status ${statusConfig.className}`}>
                                        {statusConfig.label}
                                    </span>
                                    <span className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Order Insights */}
            <div className="order-insights-section">
                <h2>{t('analytics.sections.orderInsights')}</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>📊 {t('analytics.insights.orderVolume')}</h3>
                        <p>
                            {totalOrders > 0
                                ? `${totalOrders} ${t('analytics.insights.ordersProcessed')}`
                                : t('analytics.messages.noOrdersInPeriod')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>📅 {t('analytics.insights.orderPerformance')}</h3>
                        <p>
                            {fulfillmentRate > 0
                                ? `${fulfillmentRate}% ${t('analytics.insights.ordersCompleted')}`
                                : t('analytics.messages.buildingOrderTracking')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>🎯 {t('analytics.insights.averageValue')}</h3>
                        <p>
                            {revenueData?.averageOrderValue > 0
                                ? `${formatCurrency(revenueData.averageOrderValue)} ${t(
                                      'analytics.insights.averageOrderValue',
                                  )}`
                                : t('analytics.messages.calculatingMetrics')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;
