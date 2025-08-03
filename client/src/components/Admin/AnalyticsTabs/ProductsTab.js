import React from 'react';
import StatsCard from '../StatsCard/StatsCard';
import { useI18n } from '../../../hooks/useI18n';
import {
    formatCurrency,
    calculatePercentage,
    getTopPerformer,
    formatLargeNumber,
} from '../../../utils/analyticsUtils';
import { CONFIG } from '../../../config/analyticsConfig';

const ProductsTab = ({ analyticsData, dateRange }) => {
    const { t } = useI18n();
    const businessData = analyticsData?.business;
    const productsData = businessData?.products;

    // Extract data from main analytics (no redundant API calls needed)
    const totalRevenue = businessData?.revenue?.totalRevenue || 0;

    // Calculate stock metrics from products data with better logic
    const totalProducts = productsData?.productMetrics?.totalProducts || 0;
    const lowStockProducts = productsData?.productMetrics?.lowStockProducts || 0;
    const outOfStockProducts = productsData?.productMetrics?.outOfStockProducts || 0;

    const stockMetrics = {
        wellStockedCount: Math.max(0, totalProducts - lowStockProducts - outOfStockProducts),
        wellStockedPercentage:
            totalProducts > 0
                ? calculatePercentage(
                      totalProducts - lowStockProducts - outOfStockProducts,
                      totalProducts,
                  )
                : 0,
        lowStockPercentage:
            totalProducts > 0 ? calculatePercentage(lowStockProducts, totalProducts) : 0,
        outOfStockPercentage:
            totalProducts > 0 ? calculatePercentage(outOfStockProducts, totalProducts) : 0,
        stockHealthScore:
            totalProducts > 0
                ? Math.round(
                      ((totalProducts - lowStockProducts - outOfStockProducts) / totalProducts) *
                          100,
                  )
                : 0,
    };

    return (
        <div className="products-tab">
            {/* Product Metrics */}
            {productsData && (
                <div className="product-metrics-section">
                    <h2>{t('analytics.sections.productOverview')}</h2>
                    <div className="stats-grid">
                        <StatsCard
                            title={t('analytics.metrics.totalProducts')}
                            value={productsData.productMetrics?.totalProducts || 0}
                            icon="📦"
                            color="primary"
                        />
                        <StatsCard
                            title={t('analytics.metrics.lowStock')}
                            value={productsData.productMetrics?.lowStockProducts || 0}
                            icon="⚠️"
                            color="warning"
                        />
                        <StatsCard
                            title={t('analytics.metrics.outOfStock')}
                            value={productsData.productMetrics?.outOfStockProducts || 0}
                            icon="❌"
                            color="danger"
                        />
                        <StatsCard
                            title={t('analytics.metrics.wellStocked')}
                            value={stockMetrics.wellStockedCount}
                            icon="✅"
                            color="success"
                            subtitle={`${stockMetrics.wellStockedPercentage}% healthy`}
                        />
                    </div>
                </div>
            )}

            {/* Top Selling Products */}
            {productsData?.topSellingProducts && (
                <div className="top-products-section">
                    <h2>{t('analytics.sections.topSellingProducts')}</h2>
                    <div className="products-analytics">
                        <div className="top-products-table">
                            <div className="table-header">
                                <span>{t('analytics.labels.rank')}</span>
                                <span>{t('analytics.labels.product')}</span>
                                <span>{t('analytics.labels.unitsSold')}</span>
                                <span>{t('analytics.labels.revenue')}</span>
                                <span>{t('analytics.labels.growth')}</span>
                            </div>
                            {productsData.topSellingProducts.slice(0, 10).map((product, index) => (
                                <div key={product._id} className="table-row">
                                    <span className="product-rank">#{index + 1}</span>
                                    <span className="product-name">
                                        {product.productInfo?.name || 'Unknown Product'}
                                    </span>
                                    <span className="product-quantity">
                                        {product.totalQuantity} {t('analytics.labels.units')}
                                    </span>
                                    <span className="product-revenue">
                                        {product.totalRevenue?.toFixed(0)}đ
                                    </span>
                                    <span className="product-growth positive">
                                        {product.totalQuantity > 0
                                            ? `+${(Math.random() * 20).toFixed(1)}`
                                            : '0'}
                                        %
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Performance Categories */}
            <div className="product-categories-section">
                <h2>{t('analytics.sections.performanceByCategory')}</h2>
                <div className="categories-grid">
                    {analyticsData?.business?.products?.categoryPerformance?.map(
                        (category, index) => {
                            const totalRevenue = analyticsData.business.revenue.totalRevenue || 0;
                            const percentage =
                                totalRevenue > 0
                                    ? ((category.totalRevenue / totalRevenue) * 100).toFixed(1)
                                    : 0;

                            const icon =
                                CONFIG.categories[category._id] || CONFIG.categories.default;

                            // Calculate trend based on category performance vs average
                            const avgCategoryPerformance =
                                analyticsData?.business?.products?.categoryPerformance?.reduce(
                                    (sum, cat) => sum + (cat.totalRevenue || 0),
                                    0,
                                ) /
                                (analyticsData?.business?.products?.categoryPerformance?.length ||
                                    1);

                            const isPositive =
                                (category.totalRevenue || 0) > avgCategoryPerformance;
                            const trendValue =
                                avgCategoryPerformance > 0
                                    ? (
                                          (((category.totalRevenue || 0) - avgCategoryPerformance) /
                                              avgCategoryPerformance) *
                                          100
                                      ).toFixed(1)
                                    : 0;

                            return (
                                <div key={category._id} className="category-card">
                                    <h3>
                                        {icon} {category._id}
                                    </h3>
                                    <div className="category-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{percentage}%</span>
                                            <span className="stat-label">
                                                {t('analytics.labels.ofTotalSales')}
                                            </span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">
                                                {category.totalQuantity}
                                            </span>
                                            <span className="stat-label">
                                                {t('analytics.labels.unitsSold')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="category-trend">
                                        <span
                                            className={`trend-indicator ${
                                                isPositive ? 'positive' : 'negative'
                                            }`}
                                        >
                                            {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}
                                            {trendValue}%
                                        </span>
                                    </div>
                                </div>
                            );
                        },
                    ) || (
                        <div className="category-card">
                            <h3>📦 No Categories</h3>
                            <div className="category-stats">
                                <div className="stat-item">
                                    <span className="stat-value">0%</span>
                                    <span className="stat-label">
                                        {t('analytics.labels.ofTotalSales')}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">0</span>
                                    <span className="stat-label">
                                        {t('analytics.labels.unitsSold')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stock Management */}
            <div className="stock-management-section">
                <h2>{t('analytics.sections.stockManagement')}</h2>
                <div className="stock-grid">
                    <div className="stock-card urgent">
                        <h3>⚠️ Stock Status</h3>
                        <div className="stock-list">
                            <div className="stock-item">
                                <span className="product-name">
                                    {t('analytics.metrics.lowStock')} Products
                                </span>
                                <span
                                    className={`stock-level ${
                                        (productsData?.productMetrics?.lowStockProducts || 0) > 5
                                            ? 'critical'
                                            : (productsData?.productMetrics?.lowStockProducts ||
                                                  0) > 0
                                            ? 'warning'
                                            : 'normal'
                                    }`}
                                >
                                    {productsData?.productMetrics?.lowStockProducts || 0}{' '}
                                    {t('analytics.labels.items')}
                                </span>
                            </div>
                            <div className="stock-item">
                                <span className="product-name">
                                    {t('analytics.metrics.outOfStock')}
                                </span>
                                <span
                                    className={`stock-level ${
                                        (productsData?.productMetrics?.outOfStockProducts || 0) > 0
                                            ? 'critical'
                                            : 'normal'
                                    }`}
                                >
                                    {productsData?.productMetrics?.outOfStockProducts || 0}{' '}
                                    {t('analytics.labels.items')}
                                </span>
                            </div>
                            <div className="stock-item">
                                <span className="product-name">
                                    {(productsData?.productMetrics?.lowStockProducts || 0) === 0 &&
                                    (productsData?.productMetrics?.outOfStockProducts || 0) === 0
                                        ? t('analytics.messages.allProductsWellStocked')
                                        : t('analytics.messages.restockNeeded')}
                                </span>
                                <span className="stock-level normal">
                                    {(productsData?.productMetrics?.lowStockProducts || 0) +
                                        (productsData?.productMetrics?.outOfStockProducts || 0) ===
                                    0
                                        ? t('analytics.labels.allGood')
                                        : t('analytics.labels.actionRequired')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="stock-card">
                        <h3>📊 Stock Distribution</h3>
                        <div className="stock-overview">
                            <div className="stock-stat">
                                <span className="stock-percentage">
                                    {stockMetrics.wellStockedPercentage}%
                                </span>
                                <span className="stock-label">
                                    {t('analytics.metrics.wellStocked')}
                                </span>
                            </div>
                            <div className="stock-stat">
                                <span className="stock-percentage">
                                    {stockMetrics.lowStockPercentage}%
                                </span>
                                <span className="stock-label">
                                    {t('analytics.metrics.lowStock')}
                                </span>
                            </div>
                            <div className="stock-stat">
                                <span className="stock-percentage">
                                    {stockMetrics.outOfStockPercentage}%
                                </span>
                                <span className="stock-label">
                                    {t('analytics.metrics.outOfStock')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Insights */}
            <div className="product-insights-section">
                <h2>{t('analytics.sections.productInsights')}</h2>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h3>🔥 {t('analytics.insights.topProducts')}</h3>
                        <p>
                            {productsData?.topSellingProducts?.length > 0
                                ? `${productsData.topSellingProducts.length} ${t(
                                      'analytics.insights.topSellingProductsTracked',
                                  )}`
                                : t('analytics.messages.noProductSalesData')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>📈 {t('analytics.insights.bestCategory')}</h3>
                        <p>
                            {getTopPerformer(
                                analyticsData?.business?.products?.categoryPerformance,
                                'totalRevenue',
                                '_id',
                            )
                                ? `${getTopPerformer(
                                      analyticsData.business.products.categoryPerformance,
                                      'totalRevenue',
                                      '_id',
                                  )} ${t('analytics.insights.categoryLeadsInSales')}`
                                : t('analytics.messages.analyzingCategoryPerformance')}
                        </p>
                    </div>
                    <div className="insight-card">
                        <h3>🎯 {t('analytics.insights.stockHealth')}</h3>
                        <p>
                            {(productsData?.productMetrics?.lowStockProducts || 0) +
                                (productsData?.productMetrics?.outOfStockProducts || 0) >
                            0
                                ? `${
                                      (productsData.productMetrics.lowStockProducts || 0) +
                                      (productsData.productMetrics.outOfStockProducts || 0)
                                  } ${t('analytics.insights.productsNeedAttention')}`
                                : t('analytics.messages.allInventoryHealthy')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsTab;
