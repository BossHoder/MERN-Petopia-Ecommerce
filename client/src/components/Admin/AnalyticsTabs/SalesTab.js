import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import { useI18n } from '../../../hooks/useI18n';
import {
    formatCurrency,
    calculateAverage,
    calculateWeeklySales,
    getDaysInPeriod,
    calculateDynamicGoals,
    calculatePercentage,
} from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';

const SalesTab = ({ analyticsData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;
    const revenueData = businessData?.revenue;

    // Dynamic calculations based on actual data
    const periodDays = getDaysInPeriod(dateRange);
    const currentRevenue = revenueData?.totalRevenue || 0;
    const currentOrders = revenueData?.totalOrders || 0;

    // Calculate dynamic goals based on historical performance
    const dynamicGoals = calculateDynamicGoals(currentRevenue, periodDays);

    // Calculate real metrics with proper business logic
    const realMetrics = {
        grossSales: currentRevenue, // Total sales before deductions
        netSales: currentRevenue * 0.9, // Assume 8% for fees, taxes, returns
        dailyAverage: calculateAverage(currentRevenue, periodDays, 'day'),
        weeklyAverage: calculateWeeklySales(currentRevenue, periodDays), // Use proper weekly calculation
        orderFrequency: calculateAverage(currentOrders, periodDays, 'day'),
        profitMargin: currentRevenue * 0.25, // Estimated 25% profit margin
        refundsAndReturns: currentRevenue * 0.05, // Estimated 5% refunds/returns
    };

    return (
        <div className="sales-tab">
            {/* Revenue Analytics */}
            {revenueData && (
                <div className="revenue-section">
                    <h2>{t('analytics.sections.revenueAnalytics')}</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title={t('analytics.metrics.totalRevenue')}
                            value={formatCurrency(currentRevenue)}
                            icon="💰"
                            color="success"
                        />
                        <StatsCard
                            title={t('analytics.metrics.grossSales')}
                            value={formatCurrency(realMetrics.grossSales)}
                            icon="💵"
                            color="primary"
                        />
                        <StatsCard
                            title={t('analytics.metrics.netSales')}
                            value={formatCurrency(realMetrics.netSales)}
                            icon="📊"
                            color="info"
                            subtitle={t('analytics.goals.afterFeesReturns')}
                        />
                        <StatsCard
                            title={t('analytics.metrics.profitEstimate')}
                            value={formatCurrency(realMetrics.profitMargin)}
                            icon="📈"
                            color="success"
                            subtitle={t('analytics.goals.estimatedMargin')}
                        />
                    </div>
                </div>
            )}

            {/* Sales Performance */}
            <div className="sales-performance-section">
                <h2>{t('analytics.sections.salesPerformance')}</h2>
                <div className="performance-grid">
                    <div className="performance-card">
                        <h3>Daily Sales</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">
                                    {formatCurrency(realMetrics.dailyAverage)}
                                </span>
                                <span className="metric-label">{t('analytics.labels.perDay')}</span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        realMetrics.dailyAverage >= CONFIG.targets.dailyRevenue
                                            ? 'positive'
                                            : 'neutral'
                                    }`}
                                >
                                    {realMetrics.dailyAverage >= CONFIG.targets.dailyRevenue
                                        ? `↗ ${t('analytics.status.onTrack')}`
                                        : `→ ${t('analytics.status.building')}`}
                                </span>
                                <span className="trend-label">vs daily target</span>
                            </div>
                        </div>
                    </div>

                    <div className="performance-card">
                        <h3>Weekly Sales</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">
                                    {formatCurrency(realMetrics.weeklyAverage)}
                                </span>
                                <span className="metric-label">
                                    {t('analytics.labels.perWeek')}
                                </span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        realMetrics.weeklyAverage >= CONFIG.targets.dailyRevenue * 7
                                            ? 'positive'
                                            : 'neutral'
                                    }`}
                                >
                                    {realMetrics.weeklyAverage >= CONFIG.targets.dailyRevenue * 7
                                        ? `↗ ${t('analytics.status.exceeding')}`
                                        : `→ ${t('analytics.status.growing')}`}
                                </span>
                                <span className="trend-label">weekly performance</span>
                            </div>
                        </div>
                    </div>

                    <div className="performance-card">
                        <h3>Period Total</h3>
                        <div className="performance-content">
                            <div className="performance-metric">
                                <span className="metric-value">
                                    {formatCurrency(currentRevenue)}
                                </span>
                                <span className="metric-label">
                                    {t('analytics.periods.thisPeriod')}
                                </span>
                            </div>
                            <div className="performance-trend">
                                <span
                                    className={`trend-indicator ${
                                        currentRevenue > 0 ? 'positive' : 'neutral'
                                    }`}
                                >
                                    {currentRevenue > 0
                                        ? `↗ ${realMetrics.orderFrequency.toFixed(1)} ${t(
                                              'analytics.labels.perDay',
                                          )}`
                                        : '→ No sales yet'}
                                </span>
                                <span className="trend-label">
                                    {t('analytics.metrics.orderFrequency')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Breakdown */}
            <div className="sales-breakdown-section">
                <h2>{t('analytics.sections.salesBreakdown')}</h2>
                <div className="breakdown-grid">
                    <div className="breakdown-card">
                        <h3>{t('analytics.categoryBreakdown.salesByCategory')}</h3>
                        <div className="breakdown-list">
                            {analyticsData?.business?.revenue?.salesByCategory?.map((category) => (
                                <div key={category._id} className="breakdown-item">
                                    <span className="category-name">
                                        {category._id ||
                                            t('analytics.categoryBreakdown.unknownCategory')}
                                    </span>
                                    <span className="category-value">
                                        {category.percentage?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            )) || (
                                <div className="breakdown-item">
                                    <span className="category-name">
                                        {t('analytics.messages.noCategoryData')}
                                    </span>
                                    <span className="category-value">0%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="breakdown-card">
                        <h3>{t('analytics.categoryBreakdown.paymentMethods')}</h3>
                        <div className="breakdown-list">
                            {analyticsData?.business?.revenue?.salesByPaymentMethod?.map(
                                (payment) => {
                                    const paymentConfig =
                                        CONFIG.payments[payment._id] || CONFIG.payments.default;
                                    return (
                                        <div key={payment._id} className="breakdown-item">
                                            <span className="category-name">
                                                {paymentConfig.icon} {paymentConfig.label}
                                            </span>
                                            <span className="category-value">
                                                {payment.percentage?.toFixed(1) || 0}%
                                            </span>
                                        </div>
                                    );
                                },
                            ) || (
                                <div className="breakdown-item">
                                    <span className="category-name">
                                        {t('analytics.messages.noPaymentData')}
                                    </span>
                                    <span className="category-value">0%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Goals */}
            <div className="sales-goals-section">
                <h2>{t('analytics.sections.salesGoals')}</h2>
                <div className="goals-grid">
                    <div className="goal-card">
                        <h3>{t('analytics.goals.periodGoal')}</h3>
                        <div className="goal-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(
                                            calculatePercentage(
                                                currentRevenue,
                                                dynamicGoals.monthly,
                                            ),
                                            100,
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <div className="goal-info">
                                <span>
                                    {formatCurrency(currentRevenue, false)} /{' '}
                                    {formatCurrency(dynamicGoals.monthly, false)}
                                </span>
                                <span className="goal-percentage">
                                    {calculatePercentage(currentRevenue, dynamicGoals.monthly)}%
                                </span>
                            </div>
                        </div>
                        <div className="goal-details">
                            <small>
                                {t('analytics.goals.dailyTarget')}{' '}
                                {formatCurrency(dynamicGoals.daily)} |{' '}
                                {t('analytics.goals.weeklyTarget')}{' '}
                                {formatCurrency(dynamicGoals.weekly)}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesTab;
