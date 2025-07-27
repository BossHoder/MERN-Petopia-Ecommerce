import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../store/actions/productActions';
import Loader from '../../components/Loader/Loader';
import ProductCard from '../../components/ProductCard/ProductCard';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import Sidebar from './Sidebar';
import Pagination from './Pagination';
import './Products.css';
import { useTranslation } from 'react-i18next';

const ListIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3" y2="6" />
        <line x1="3" y1="12" x2="3" y2="12" />
        <line x1="3" y1="18" x2="3" y2="18" />
    </svg>
);
const GridIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const Products = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('products');

    const { products, pagination, productsLoading, error } = useSelector((state) => state.products);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryFilters = Object.fromEntries(params.entries());

        // Ensure limit=4 is set if not present in URL
        if (!queryFilters.limit) {
            queryFilters.limit = '4';
            // Update URL to include limit parameter
            params.set('limit', '4');
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }

        // Initialize sort state from URL
        if (queryFilters.sortBy && queryFilters.sortOrder) {
            const sortKey = `${queryFilters.sortBy}-${queryFilters.sortOrder}`;
            const sortMapping = {
                'createdAt-desc': 'relevance',
                'price-asc': 'price-low',
                'price-desc': 'price-high',
            };
            setSortBy(sortMapping[sortKey] || 'relevance');
        }

        dispatch(getAllProducts(queryFilters));
    }, [dispatch, location.search, navigate, location.pathname]);

    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams(location.search);
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key]) {
                params.set(key, newFilters[key]);
            } else {
                params.delete(key);
            }
        });
        params.set('page', '1');
        // Ensure limit=4 is always set for consistent pagination
        if (!params.has('limit')) {
            params.set('limit', '4');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        // Ensure limit=4 is always set for consistent pagination
        if (!params.has('limit')) {
            params.set('limit', '4');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleSortChange = (sortValue) => {
        setSortBy(sortValue);
        const params = new URLSearchParams(location.search);

        // Map frontend sort values to backend parameters
        const sortMapping = {
            relevance: { sortBy: 'createdAt', sortOrder: 'desc' },
            'price-low': { sortBy: 'price', sortOrder: 'asc' },
            'price-high': { sortBy: 'price', sortOrder: 'desc' },
        };

        const sortConfig = sortMapping[sortValue] || sortMapping['relevance'];

        // Remove old sort parameters
        params.delete('sort');
        params.delete('sortBy');
        params.delete('sortOrder');

        // Set new sort parameters
        params.set('sortBy', sortConfig.sortBy);
        params.set('sortOrder', sortConfig.sortOrder);
        params.set('page', '1');

        // Ensure limit=4 is always set for consistent pagination
        if (!params.has('limit')) {
            params.set('limit', '4');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
    ];

    return (
        <div className="products-page">
            <div className="products-container">
                <Sidebar onFilterChange={handleFilterChange} />
                <div className="products-main">
                    {/* Breadcrumb Navigation */}
                    <BreadcrumbNavigation
                        items={breadcrumbItems}
                        ariaLabel={t('breadcrumb.productNavigation')}
                    />
                    {/* Header */}
                    <div className="products-header">
                        <div className="products-title-section">
                            <h1 className="products-title">{t('products.title')}</h1>
                            {pagination && (
                                <p className="products-count">
                                    Showing {(pagination.currentPage - 1) * pagination.limit + 1}-
                                    {Math.min(
                                        pagination.currentPage * pagination.limit,
                                        pagination.totalProducts,
                                    )}{' '}
                                    {t('products.of')} {pagination.totalProducts}{' '}
                                    {t('products.results')}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="products-controls">
                        <div className="sort-controls">
                            <span className="sort-label">{t('products.sortBy')}:</span>
                            <div className="sort-buttons">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`sort-btn${
                                            sortBy === option.value ? ' active' : ''
                                        }`}
                                        onClick={() => handleSortChange(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="view-controls">
                            <button
                                className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title={t('products.listView')}
                            >
                                <ListIcon />
                            </button>
                            <button
                                className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title={t('products.gridView')}
                            >
                                <GridIcon />
                            </button>
                        </div>
                    </div>
                    {/* Products Grid/List */}
                    <div className="products-content">
                        {productsLoading ? (
                            <div className="products-loading">
                                <Loader />
                            </div>
                        ) : error ? (
                            <div className="products-error">
                                <p className="error-message">{error}</p>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div
                                    className={`products-grid ${
                                        viewMode === 'list' ? 'list-view' : 'grid-view'
                                    }`}
                                >
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id || product.id}
                                            product={product}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="pagination-wrapper">
                                        <Pagination
                                            pagination={pagination}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-products-found">
                                <div className="no-products-icon">🐾</div>
                                <h3>{t('products.noProductsFound')}</h3>
                                <p>{t('products.adjustFilters')}</p>
                                <button
                                    className="clear-filters-btn"
                                    onClick={() => {
                                        navigate('/products?limit=4');
                                    }}
                                >
                                    {t('products.clearAllFilters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
