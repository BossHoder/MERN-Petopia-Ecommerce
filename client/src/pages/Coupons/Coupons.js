import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { getActiveCoupons, clearCouponErrors } from '../../store/actions/couponActions';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import Loader from '../../components/Loader/Loader';
import CouponCard from './CouponCard';
import CouponFilters from './CouponFilters';
import Pagination from './Pagination';
import './Coupons.css';

const Coupons = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [discountTypeFilter, setDiscountTypeFilter] = useState('all');

    // Get URL parameters
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const sortBy = searchParams.get('sortBy') || 'validUntil';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Redux state
    const { coupons, couponsPagination, couponsLoading, error } = useSelector(
        (state) => state.coupons,
    );

    // Breadcrumb setup
    const breadcrumbItems = [
        {
            name: t('navigation.coupons', 'Coupons'),
            path: '/coupons',
            current: true,
        },
    ];

    useBreadcrumb(breadcrumbItems);

    // Load coupons on component mount and when parameters change
    useEffect(() => {
        const filters = {};
        if (discountTypeFilter !== 'all') {
            filters.discountType = discountTypeFilter;
        }

        dispatch(getActiveCoupons(currentPage, limit, searchTerm, sortBy, sortOrder, filters));
    }, [dispatch, currentPage, limit, searchTerm, sortBy, sortOrder, discountTypeFilter]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearCouponErrors());
        }
    }, [error, dispatch]);

    // Event handlers
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleRefresh = useCallback(() => {
        const filters = {};
        if (discountTypeFilter !== 'all') {
            filters.discountType = discountTypeFilter;
        }
        dispatch(getActiveCoupons(currentPage, limit, searchTerm, sortBy, sortOrder, filters));
    }, [dispatch, currentPage, limit, searchTerm, sortBy, sortOrder, discountTypeFilter]);

    // Auto-refresh when page becomes visible (user returns to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Page became visible, refresh data
                handleRefresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleRefresh]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleDiscountTypeFilter = (type) => {
        setDiscountTypeFilter(type);
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (type !== 'all') {
            params.set('discountType', type);
        } else {
            params.delete('discountType');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleSortChange = (newSortBy, newSortOrder) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        params.set('sortBy', newSortBy);
        params.set('sortOrder', newSortOrder);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    if (couponsLoading && coupons.length === 0) {
        return <Loader />;
    }

    // Generate structured data for SEO
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: t('coupons.title', 'Available Coupons'),
        description: t(
            'coupons.subtitle',
            'Save money on your pet supplies with our exclusive offers',
        ),
        url: `${window.location.origin}/coupons`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: couponsPagination.totalCoupons,
            itemListElement: coupons.map((coupon, index) => ({
                '@type': 'Offer',
                position: index + 1,
                name: coupon.description,
                description: coupon.description,
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    price: coupon.discountValue,
                    priceCurrency: 'VND',
                },
                validFrom: coupon.validFrom,
                validThrough: coupon.validUntil,
                availability: 'https://schema.org/InStock',
            })),
        },
    };

    return (
        <>
            <Helmet>
                <title>{t('coupons.title', 'Available Coupons')} - Petopia</title>
                <meta
                    name="description"
                    content={t(
                        'coupons.subtitle',
                        'Save money on your pet supplies with our exclusive offers',
                    )}
                />
                <meta
                    name="keywords"
                    content="pet coupons, pet discounts, pet supplies deals, dog food coupons, cat food discounts, pet store promotions"
                />
                <meta
                    property="og:title"
                    content={`${t('coupons.title', 'Available Coupons')} - Petopia`}
                />
                <meta
                    property="og:description"
                    content={t(
                        'coupons.subtitle',
                        'Save money on your pet supplies with our exclusive offers',
                    )}
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${window.location.origin}/coupons`} />
                <meta property="og:image" content={`${window.location.origin}/logo192.png`} />
                <meta name="twitter:card" content="summary" />
                <meta
                    name="twitter:title"
                    content={`${t('coupons.title', 'Available Coupons')} - Petopia`}
                />
                <meta
                    name="twitter:description"
                    content={t(
                        'coupons.subtitle',
                        'Save money on your pet supplies with our exclusive offers',
                    )}
                />
                <link rel="canonical" href={`${window.location.origin}/coupons`} />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>

            <div className="coupons-page">
                <div className="coupons-container">
                    {/* Breadcrumb */}
                    <BreadcrumbNavigation />

                    {/* Header */}
                    <div className="coupons-header">
                        <div className="coupons-title">
                            <h1>{t('coupons.title', 'Available Coupons')}</h1>
                            <p className="coupons-subtitle">
                                {t(
                                    'coupons.subtitle',
                                    'Save money on your pet supplies with our exclusive offers',
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <CouponFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onSearchSubmit={handleSearch}
                        discountTypeFilter={discountTypeFilter}
                        onDiscountTypeChange={handleDiscountTypeFilter}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        totalCoupons={couponsPagination.totalCoupons}
                        onRefresh={handleRefresh}
                    />

                    {/* Coupons Grid */}
                    <div className="coupons-content">
                        {couponsLoading ? (
                            <div className="coupons-loading">
                                <Loader />
                            </div>
                        ) : coupons.length > 0 ? (
                            <>
                                <div className="coupons-grid">
                                    {coupons.map((coupon) => (
                                        <CouponCard key={coupon.id} coupon={coupon} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <Pagination
                                    pagination={couponsPagination}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <div className="coupons-empty">
                                <div className="empty-icon">🎫</div>
                                <h3>{t('coupons.noCoupons', 'No coupons available')}</h3>
                                <p>
                                    {t(
                                        'coupons.noCouponsDescription',
                                        'Check back later for new promotional offers!',
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Coupons;
