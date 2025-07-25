import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../store/actions/productActions';
import Loader from '../../components/Loader/Loader';
import ProductCard from '../../components/ProductCard/ProductCard';
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

    const { products, pagination, productsLoading, error } = useSelector((state) => state.products);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryFilters = Object.fromEntries(params.entries());
        dispatch(getAllProducts(queryFilters));
    }, [dispatch, location.search]);

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
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        const params = new URLSearchParams(location.search);
        params.set('sort', sort);
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const sortOptions = [
        { value: 'relevance', label: 'Relevance' },
        { value: 'price', label: 'Price' },
        { value: 'rating', label: 'Rating' },
        { value: 'newest', label: 'Newest' },
    ];

    return (
        <div className="products-page">
            <div className="products-container">
                <Sidebar onFilterChange={handleFilterChange} />
                <div className="products-main">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <ol className="breadcrumb-list">
                            <li>
                                <a href="#" className="breadcrumb-link">
                                    Home
                                </a>
                            </li>
                            <li>
                                <span className="breadcrumb-separator">/</span>
                            </li>
                            <li>
                                <a href="#" className="breadcrumb-link">
                                    Shop
                                </a>
                            </li>
                            <li>
                                <span className="breadcrumb-separator">/</span>
                            </li>
                            <li className="breadcrumb-current">Products</li>
                        </ol>
                    </nav>
                    {/* Header */}
                    <div className="products-header">
                        <div className="products-title-section">
                            <h1 className="products-title">
                                {t('products.title', 'Our Products')}
                            </h1>
                            {pagination && (
                                <p className="products-count">
                                    Showing {(pagination.currentPage - 1) * pagination.limit + 1}-
                                    {Math.min(
                                        pagination.currentPage * pagination.limit,
                                        pagination.total,
                                    )}{' '}
                                    of {pagination.total} results
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="products-controls">
                        <div className="sort-controls">
                            <span className="sort-label">Sort by:</span>
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
                                title="List view"
                            >
                                <ListIcon />
                            </button>
                            <button
                                className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
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
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
