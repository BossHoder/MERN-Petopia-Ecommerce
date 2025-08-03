import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import {
    calculateFunnelEfficiency,
    calculateImprovementPotential,
    getTopPerformer,
    calculatePercentage,
} from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';
import { useI18n } from '../../../hooks/useI18n';

const ConversionTab = ({ analyticsData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;
    const conversionData = businessData?.conversion;

    // Validate conversion data structure
    const isValidConversionData =
        conversionData &&
        typeof conversionData === 'object' &&
        Object.keys(conversionData).length > 0;

    // Calculate key metrics using utility functions with validation
    const funnelEfficiency = isValidConversionData ? calculateFunnelEfficiency(conversionData) : 0;
    const improvementPotential = isValidConversionData
        ? calculateImprovementPotential(conversionData)
        : 25;
    const overallConversionRate = conversionData?.order_completed?.conversionRate || 0;

    // Additional conversion metrics
    const conversionMetrics = {
        totalViews: conversionData?.product_viewed?.count || 0,
        totalCarts: conversionData?.product_added_to_cart?.count || 0,
        totalCheckouts: conversionData?.checkout_started?.count || 0,
        totalOrders: conversionData?.order_completed?.count || 0,
        viewToCartRate: conversionData?.product_added_to_cart?.conversionRate || 0,
        cartToCheckoutRate: conversionData?.checkout_started?.conversionRate || 0,
        checkoutToOrderRate: conversionData?.order_completed?.conversionRate || 0,
    };

    return (
        <div className="conversion-tab">
            {/* Show message if no conversion data */}
            {!isValidConversionData && (
                <div className="no-data-message">
                    <h3>🚀 Getting Started with Conversion Tracking</h3>
                    <p>
                        No conversion data available yet. Once customers start interacting with your
                        store, you'll see detailed conversion funnel analytics here.
                    </p>
                </div>
            )}

            {/* Conversion Overview */}
            {isValidConversionData && (
                <div className="conversion-overview-section">
                    <h2>{t('analytics.sections.conversionOverview')}</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title={t('analytics.metrics.overallConversionRate')}
                            value={`${overallConversionRate}%`}
                            icon="🎯"
                            color="success"
                        />
                        <StatsCard
                            title={t('analytics.metrics.cartConversion')}
                            value={`${(
                                conversionData.product_added_to_cart?.conversionRate || 0
                            ).toFixed(1)}%`}
                            icon="🛒"
                            color="primary"
                        />
                        <StatsCard
                            title={t('analytics.metrics.checkoutConversion')}
                            value={`${(
                                conversionData.checkout_started?.conversionRate || 0
                            ).toFixed(1)}%`}
                            icon="💳"
                            color="info"
                        />
                        <StatsCard
                            title={t('analytics.metrics.funnelEfficiency')}
                            value={`${funnelEfficiency}%`}
                            icon="⚡"
                            color="warning"
                        />
                    </div>
                </div>
            )}

            {/* Conversion Funnel */}
            {isValidConversionData && (
                <div className="conversion-funnel-section">
                    <h2>Conversion Funnel</h2>
                    <div className="funnel-chart">
                        {Object.entries(conversionData)
                            .sort(([a], [b]) => {
                                const orderA = CONFIG.conversion[a]?.order || 999;
                                const orderB = CONFIG.conversion[b]?.order || 999;
                                return orderA - orderB;
                            })
                            .map(([step, data], index) => {
                                const stepConfig = CONFIG.conversion[step] || {
                                    icon: '📊',
                                    label: step,
                                };

                                return (
                                    <div key={step} className="funnel-step">
                                        <div className="step-visual">
                                            <div
                                                className="funnel-bar"
                                                style={{
                                                    width: `${Math.max(
                                                        20,
                                                        data.conversionRate * 2,
                                                    )}%`,
                                                    background: `hsl(${
                                                        120 - index * 30
                                                    }, 70%, 50%)`,
                                                }}
                                            >
                                                <span className="step-count">{data.count}</span>
                                            </div>
                                        </div>
                                        <div className="step-info">
                                            <div className="step-name">
                                                {stepConfig.icon} {stepConfig.label}
                                            </div>
                                            <div className="step-rate">{data.conversionRate}%</div>
                                        </div>
                                        {index < Object.entries(conversionData).length - 1 && (
                                            <div className="funnel-arrow">→</div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Conversion by Channel - DYNAMIC */}
            <div className="conversion-channels-section">
                <h2>Conversion Analysis</h2>
                <div className="channels-grid">
                    <div className="channel-card">
                        <h3>📊 Overall Performance</h3>
                        <div className="channel-stats">
                            <div className="conversion-rate">
                                <span className="rate-value">
                                    {overallConversionRate.toFixed(1)}%
                                </span>
                                <span className="rate-label">Overall Conversion</span>
                            </div>
                            <div className="channel-performance">
                                <span
                                    className={`performance-indicator ${
                                        overallConversionRate >= CONFIG.performance.conversion.high
                                            ? 'high'
                                            : overallConversionRate >=
                                              CONFIG.performance.conversion.medium
                                            ? 'medium'
                                            : 'low'
                                    }`}
                                >
                                    {overallConversionRate >= CONFIG.performance.conversion.high
                                        ? 'High Performance'
                                        : overallConversionRate >=
                                          CONFIG.performance.conversion.medium
                                        ? 'Good Performance'
                                        : 'Building Performance'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="channel-card">
                        <h3>🎯 Funnel Analysis</h3>
                        <div className="channel-stats">
                            <div className="conversion-rate">
                                <span className="rate-value">
                                    {Object.keys(conversionData || {}).length}
                                </span>
                                <span className="rate-label">Tracked Steps</span>
                            </div>
                            <div className="channel-performance">
                                <span className="performance-indicator medium">
                                    Active Tracking
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="channel-card">
                        <h3>🔄 {t('analytics.labels.customerJourney')}</h3>
                        <div className="channel-stats">
                            <div className="conversion-rate">
                                <span className="rate-value">
                                    {conversionData?.product_viewed?.count || 0}
                                </span>
                                <span className="rate-label">
                                    {t('analytics.labels.pageViews')}
                                </span>
                            </div>
                            <div className="channel-performance">
                                <span
                                    className={`performance-indicator ${
                                        (conversionData?.product_viewed?.count || 0) > 0
                                            ? 'high'
                                            : 'low'
                                    }`}
                                >
                                    {(conversionData?.product_viewed?.count || 0) > 0
                                        ? t('analytics.status.activeTraffic')
                                        : t('analytics.status.lowTraffic')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="channel-card">
                        <h3>💡 Opportunities</h3>
                        <div className="channel-stats">
                            <div className="conversion-rate">
                                <span className="rate-value">
                                    {improvementPotential.toFixed(0)}%
                                </span>
                                <span className="rate-label">
                                    {t('analytics.labels.improvementPotential')}
                                </span>
                            </div>
                            <div className="channel-performance">
                                <span className="performance-indicator medium">
                                    {t('analytics.status.growthReady')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion Performance Analysis */}
            <div className="device-conversion-section">
                <h2>{t('analytics.sections.performanceAnalysis')}</h2>
                <div className="device-grid">
                    <div className="device-card">
                        <h3>📈 {t('analytics.conversionSteps.conversionSteps')}</h3>
                        <div className="device-breakdown">
                            {Object.entries(conversionData || {}).map(([step, data]) => (
                                <div key={step} className="device-item">
                                    <span className="device-name">
                                        {step.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="device-rate">
                                        {data.conversionRate?.toFixed(1) || 0}%
                                    </span>
                                    <div className="device-bar">
                                        <div
                                            className="device-fill"
                                            style={{
                                                width: `${Math.min(
                                                    (data.conversionRate || 0) * 10,
                                                    100,
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="device-card">
                        <h3>🎯 {t('analytics.conversionSteps.conversionHealth')}</h3>
                        <div className="device-breakdown">
                            <div className="device-item">
                                <span className="device-name">
                                    {t('analytics.labels.funnelCompletion')}
                                </span>
                                <span className="device-rate">{funnelEfficiency}%</span>
                                <div className="device-bar">
                                    <div
                                        className="device-fill success"
                                        style={{
                                            width: `${Math.min(funnelEfficiency * 5, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="device-item">
                                <span className="device-name">
                                    {t('analytics.labels.customerJourney')}
                                </span>
                                <span className="device-rate">
                                    {conversionData?.order_completed?.count || 0}{' '}
                                    {t('analytics.labels.orders')}
                                </span>
                                <div className="device-bar">
                                    <div
                                        className="device-fill info"
                                        style={{
                                            width: `${Math.min(
                                                (conversionData?.order_completed?.count || 0) * 10,
                                                100,
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion Optimization */}
            <div className="conversion-optimization-section">
                <h2>{t('analytics.sections.conversionOptimization')}</h2>
                <div className="optimization-grid">
                    <div className="optimization-card">
                        <h3>🚨 {t('analytics.optimization.areasForImprovement')}</h3>
                        <div className="improvement-list">
                            <div className="improvement-item high-priority">
                                <span className="priority-indicator">🔴</span>
                                <span className="improvement-text">
                                    {overallConversionRate < CONFIG.performance.conversion.medium
                                        ? t('analytics.optimization.lowConversionRate')
                                        : t('analytics.optimization.conversionRateHealthy')}
                                </span>
                            </div>
                            <div className="improvement-item medium-priority">
                                <span className="priority-indicator">🟡</span>
                                <span className="improvement-text">
                                    {(conversionData?.product_added_to_cart?.count || 0) >
                                    (conversionData?.checkout_started?.count || 0)
                                        ? t('analytics.optimization.cartAbandonmentDetected')
                                        : t('analytics.optimization.cartCheckoutFlowGood')}
                                </span>
                            </div>
                            <div className="improvement-item low-priority">
                                <span className="priority-indicator">🟢</span>
                                <span className="improvement-text">
                                    {(conversionData?.product_viewed?.count || 0) > 0
                                        ? t('analytics.optimization.productPagesGettingTraffic')
                                        : t('analytics.optimization.focusOnDrivingViews')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="optimization-card">
                        <h3>✅ {t('analytics.optimization.recentImprovements')}</h3>
                        <div className="success-list">
                            <div className="success-item">
                                <span className="success-icon">✓</span>
                                <span className="success-text">
                                    {t('analytics.optimization.analyticsTrackingActive')}{' '}
                                    {Object.keys(conversionData || {}).length}{' '}
                                    {t('analytics.optimization.conversionStepsMonitored')}
                                </span>
                            </div>
                            <div className="success-item">
                                <span className="success-icon">✓</span>
                                <span className="success-text">
                                    {t('analytics.optimization.funnelVisibilityEstablished')}
                                </span>
                            </div>
                            <div className="success-item">
                                <span className="success-icon">✓</span>
                                <span className="success-text">
                                    {(conversionData?.order_completed?.count || 0) > 0
                                        ? `${conversionData.order_completed.count} ${t(
                                              'analytics.optimization.successfulConversionsTracked',
                                          )}`
                                        : t('analytics.messages.conversionTrackingReady')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion Insights */}
            <div className="conversion-insights-section">
                <h2>{t('analytics.sections.conversionInsights')}</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>📊 {t('analytics.insights.conversionHealth')}</h3>
                        <p>
                            {overallConversionRate > 0
                                ? `${overallConversionRate.toFixed(2)}% ${t(
                                      'analytics.insights.overallConversionRate',
                                  )}`
                                : t('analytics.messages.buildingConversionBaseline')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>🎯 {t('analytics.insights.topFunnelStep')}</h3>
                        <p>
                            {getTopPerformer(
                                Object.entries(conversionData || {}).map(([step, data]) => ({
                                    _id: step,
                                    count: data.count,
                                })),
                                'count',
                                '_id',
                            )
                                ? `${
                                      CONFIG.conversion[
                                          getTopPerformer(
                                              Object.entries(conversionData || {}).map(
                                                  ([step, data]) => ({
                                                      _id: step,
                                                      count: data.count,
                                                  }),
                                              ),
                                              'count',
                                              '_id',
                                          )
                                      ]?.label || 'Unknown step'
                                  } ${t('analytics.insights.highestEngagement')}`
                                : t('analytics.messages.analyzingFunnelPerformance')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>💡 {t('analytics.insights.nextSteps')}</h3>
                        <p>
                            {improvementPotential > 30
                                ? t('analytics.insights.highImprovementPotential')
                                : improvementPotential > 15
                                ? t('analytics.insights.goodOptimizationOpportunities')
                                : t('analytics.insights.conversionPerformingWell')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversionTab;
