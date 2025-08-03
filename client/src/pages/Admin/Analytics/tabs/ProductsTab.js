import React, { useEffect, useState } from 'react';
import API from '../../../../services/api';
import StatsCard from '../../../../components/Admin/StatsCard/StatsCard';
import './TabStyles.css';

const ProductsTab = ({ dateRange, onDateRangeChange }) => {
    const [productsData, setProductsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProductsData = async () => {
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

            setProductsData({
                business: businessResponse.data.data,
                dateRange: { start: startDate, end: new Date() },
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching products data:', err);
            setError('Failed to load products data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="loading-spinner"></div>
                <p>Loading product analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <h3>Error Loading Product Data</h3>
                <p>{error}</p>
                <button onClick={fetchProductsData} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const businessData = productsData?.business;
    const productMetrics = businessData?.products?.productMetrics;
    const topProducts = businessData?.products?.topSellingProducts || [];

    return (
        <div className="tab-content products-tab">
            {/* Tab Header */}
            <div className="tab-header">
                <h2 className="tab-title">📦 Product Analytics</h2>
                <p className="tab-description">
                    Product performance, inventory insights, and sales analysis across your catalog
                </p>
            </div>

            {/* Product Overview */}
            {productMetrics && (
                <div className="section">
                    <h3 className="section-title">📊 Product Overview</h3>
                    <div className="stats-grid">
                        <StatsCard
                            title="Total Products"
                            value={productMetrics.totalProducts || 0}
                            icon="📦"
                            color="primary"
                            subtitle="In catalog"
                        />
                        <StatsCard
                            title="Active Products"
                            value={
                                (productMetrics.totalProducts || 0) -
                                (productMetrics.outOfStockProducts || 0)
                            }
                            icon="✅"
                            color="success"
                            subtitle="Currently available"
                        />
                        <StatsCard
                            title="Low Stock"
                            value={productMetrics.lowStockProducts || 0}
                            icon="⚠️"
                            color="warning"
                            subtitle="Need restocking"
                        />
                        <StatsCard
                            title="Out of Stock"
                            value={productMetrics.outOfStockProducts || 0}
                            icon="❌"
                            color="danger"
                            subtitle="Unavailable"
                        />
                    </div>
                </div>
            )}

            {/* Top Selling Products */}
            {topProducts.length > 0 && (
                <div className="section">
                    <h3 className="section-title">🏆 Top Selling Products</h3>
                    <div className="chart-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Units Sold</th>
                                    <th>Revenue</th>
                                    <th>Avg Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.slice(0, 10).map((product, index) => (
                                    <tr key={product._id}>
                                        <td>
                                            <span className={`rank-badge rank-${index + 1}`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="product-info">
                                                <strong>
                                                    {product.productInfo?.name || 'Unknown Product'}
                                                </strong>
                                                <br />
                                                <small>
                                                    {product.productInfo?.brand || 'No Brand'}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            {product.productInfo?.category?.name || 'Uncategorized'}
                                        </td>
                                        <td>
                                            <strong>{product.totalQuantity || 0}</strong> units
                                        </td>
                                        <td>
                                            <strong>
                                                ${(product.totalRevenue || 0).toLocaleString()}
                                            </strong>
                                        </td>
                                        <td>
                                            $
                                            {product.totalQuantity
                                                ? (
                                                      product.totalRevenue / product.totalQuantity
                                                  ).toFixed(2)
                                                : '0.00'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Performance Metrics */}
            <div className="section">
                <h3 className="section-title">📈 Performance Metrics</h3>
                <div className="metric-cards">
                    <div className="metric-card">
                        <div className="metric-value">
                            {topProducts.reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}
                        </div>
                        <div className="metric-label">Total Units Sold</div>
                        <div className="metric-change positive">+{topProducts.length} products</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            $
                            {topProducts
                                .reduce((sum, p) => sum + (p.totalRevenue || 0), 0)
                                .toLocaleString()}
                        </div>
                        <div className="metric-label">Product Revenue</div>
                        <div className="metric-change positive">Total from products</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            $
                            {topProducts.length > 0
                                ? (
                                      topProducts.reduce(
                                          (sum, p) => sum + (p.totalRevenue || 0),
                                          0,
                                      ) /
                                      topProducts.reduce(
                                          (sum, p) => sum + (p.totalQuantity || 0),
                                          0,
                                      )
                                  ).toFixed(2)
                                : '0.00'}
                        </div>
                        <div className="metric-label">Avg Product Price</div>
                        <div className="metric-change neutral">Across all sales</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            {topProducts.length > 0
                                ? (
                                      topProducts.reduce(
                                          (sum, p) => sum + (p.totalQuantity || 0),
                                          0,
                                      ) / topProducts.length
                                  ).toFixed(1)
                                : '0'}
                        </div>
                        <div className="metric-label">Avg Units Per Product</div>
                        <div className="metric-change neutral">Sales distribution</div>
                    </div>
                </div>
            </div>

            {/* Product Categories */}
            <div className="section">
                <h3 className="section-title">🏷️ Category Performance</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>🐕 Dog Products</h4>
                        <p className="insight-value">
                            {
                                topProducts.filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('dog') ||
                                        p.productInfo?.name?.toLowerCase().includes('dog'),
                                ).length
                            }
                        </p>
                        <span className="insight-detail">
                            {topProducts
                                .filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('dog') ||
                                        p.productInfo?.name?.toLowerCase().includes('dog'),
                                )
                                .reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}{' '}
                            units sold
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>🐱 Cat Products</h4>
                        <p className="insight-value">
                            {
                                topProducts.filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('cat') ||
                                        p.productInfo?.name?.toLowerCase().includes('cat') ||
                                        p.productInfo?.name?.toLowerCase().includes('mèo'),
                                ).length
                            }
                        </p>
                        <span className="insight-detail">
                            {topProducts
                                .filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('cat') ||
                                        p.productInfo?.name?.toLowerCase().includes('cat') ||
                                        p.productInfo?.name?.toLowerCase().includes('mèo'),
                                )
                                .reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}{' '}
                            units sold
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>🍖 Food & Treats</h4>
                        <p className="insight-value">
                            {
                                topProducts.filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('food') ||
                                        p.productInfo?.name?.toLowerCase().includes('food') ||
                                        p.productInfo?.name?.toLowerCase().includes('treat'),
                                ).length
                            }
                        </p>
                        <span className="insight-detail">
                            {topProducts
                                .filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('food') ||
                                        p.productInfo?.name?.toLowerCase().includes('food') ||
                                        p.productInfo?.name?.toLowerCase().includes('treat'),
                                )
                                .reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}{' '}
                            units sold
                        </span>
                    </div>
                    <div className="insight-card">
                        <h4>🧸 Toys & Accessories</h4>
                        <p className="insight-value">
                            {
                                topProducts.filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('toy') ||
                                        p.productInfo?.name?.toLowerCase().includes('toy') ||
                                        p.productInfo?.name?.toLowerCase().includes('accessory'),
                                ).length
                            }
                        </p>
                        <span className="insight-detail">
                            {topProducts
                                .filter(
                                    (p) =>
                                        p.productInfo?.category?.name
                                            ?.toLowerCase()
                                            .includes('toy') ||
                                        p.productInfo?.name?.toLowerCase().includes('toy') ||
                                        p.productInfo?.name?.toLowerCase().includes('accessory'),
                                )
                                .reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}{' '}
                            units sold
                        </span>
                    </div>
                </div>
            </div>

            {/* Inventory Status */}
            <div className="section">
                <h3 className="section-title">📋 Inventory Management</h3>
                <div className="chart-container">
                    <div className="chart-header">
                        <h4 className="chart-title">Stock Status Overview</h4>
                        <p className="chart-subtitle">Monitor inventory levels and stock alerts</p>
                    </div>
                    <div className="metric-cards">
                        <div className="metric-card">
                            <div className="metric-value" style={{ color: '#059669' }}>
                                {Math.max(
                                    0,
                                    (productMetrics?.totalProducts || 0) -
                                        (productMetrics?.lowStockProducts || 0) -
                                        (productMetrics?.outOfStockProducts || 0),
                                )}
                            </div>
                            <div className="metric-label">Well Stocked</div>
                            <div className="metric-change positive">
                                {(
                                    (Math.max(
                                        0,
                                        (productMetrics?.totalProducts || 0) -
                                            (productMetrics?.lowStockProducts || 0) -
                                            (productMetrics?.outOfStockProducts || 0),
                                    ) /
                                        Math.max(1, productMetrics?.totalProducts || 1)) *
                                    100
                                ).toFixed(1)}
                                %
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value" style={{ color: '#d97706' }}>
                                {productMetrics?.lowStockProducts || 0}
                            </div>
                            <div className="metric-label">Low Stock Alert</div>
                            <div className="metric-change negative">Needs attention</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value" style={{ color: '#dc2626' }}>
                                {productMetrics?.outOfStockProducts || 0}
                            </div>
                            <div className="metric-label">Out of Stock</div>
                            <div className="metric-change negative">Lost sales potential</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">
                                {(
                                    (((productMetrics?.totalProducts || 0) -
                                        (productMetrics?.outOfStockProducts || 0)) /
                                        Math.max(1, productMetrics?.totalProducts || 1)) *
                                    100
                                ).toFixed(1)}
                                %
                            </div>
                            <div className="metric-label">Availability Rate</div>
                            <div className="metric-change positive">Products in stock</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsTab;
