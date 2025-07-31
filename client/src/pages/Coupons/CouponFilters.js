import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const CouponFilters = ({
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    discountTypeFilter,
    onDiscountTypeChange,
    sortBy,
    sortOrder,
    onSortChange,
    totalCoupons,
    onRefresh,
}) => {
    const { t } = useTranslation();

    const handleSortChange = (e) => {
        const [newSortBy, newSortOrder] = e.target.value.split('-');
        onSortChange(newSortBy, newSortOrder);
    };

    return (
        <section className="coupon-filters" role="search" aria-label="Coupon filters and search">
            <div className="filters-row">
                {/* Search */}
                <form onSubmit={onSearchSubmit} className="search-form" role="search">
                    <div className="search-input-group">
                        <label htmlFor="coupon-search" className="sr-only">
                            {t('coupons.searchPlaceholder', 'Search coupons...')}
                        </label>
                        <input
                            id="coupon-search"
                            type="text"
                            placeholder={t('coupons.searchPlaceholder', 'Search coupons...')}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input"
                            aria-describedby="search-help"
                        />
                        <button
                            type="submit"
                            className="search-button"
                            aria-label={t('common.search', 'Search')}
                        >
                            <i className="fas fa-search" aria-hidden="true"></i>
                        </button>
                        {onRefresh && (
                            <button
                                type="button"
                                className="refresh-button"
                                onClick={onRefresh}
                                aria-label={t('common.refresh', 'Refresh')}
                                title={t('common.refresh', 'Refresh')}
                            >
                                <i className="fas fa-sync-alt" aria-hidden="true"></i>
                            </button>
                        )}
                    </div>
                    <div id="search-help" className="sr-only">
                        Search for coupons by code or description
                    </div>
                </form>

                {/* Filters */}
                <div className="filter-controls">
                    {/* Discount Type Filter */}
                    <div className="filter-group">
                        <label htmlFor="discount-type-filter" className="filter-label">
                            {t('coupons.discountType', 'Discount Type')}:
                        </label>
                        <select
                            id="discount-type-filter"
                            value={discountTypeFilter}
                            onChange={(e) => onDiscountTypeChange(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('coupons.allTypes', 'All Types')}</option>
                            <option value="percentage">
                                {t('coupons.percentage', 'Percentage')}
                            </option>
                            <option value="fixed">{t('coupons.fixed', 'Fixed Amount')}</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="filter-group">
                        <label htmlFor="sort-select" className="filter-label">
                            {t('coupons.sortBy', 'Sort by')}:
                        </label>
                        <select
                            id="sort-select"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={handleSortChange}
                            className="filter-select"
                        >
                            <option value="validUntil-asc">
                                {t('coupons.sortExpirationAsc', 'Expiration (Earliest first)')}
                            </option>
                            <option value="validUntil-desc">
                                {t('coupons.sortExpirationDesc', 'Expiration (Latest first)')}
                            </option>
                            <option value="discountValue-desc">
                                {t('coupons.sortDiscountDesc', 'Discount (Highest first)')}
                            </option>
                            <option value="discountValue-asc">
                                {t('coupons.sortDiscountAsc', 'Discount (Lowest first)')}
                            </option>
                            <option value="minOrderValue-asc">
                                {t('coupons.sortMinOrderAsc', 'Min Order (Lowest first)')}
                            </option>
                            <option value="minOrderValue-desc">
                                {t('coupons.sortMinOrderDesc', 'Min Order (Highest first)')}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="results-info" role="status" aria-live="polite">
                <span className="results-count">
                    {totalCoupons > 0
                        ? t('coupons.resultsCount', '{{count}} coupon(s) available', {
                              count: totalCoupons,
                          })
                        : t('coupons.noResults', 'No coupons found')}
                </span>
            </div>
        </section>
    );
};

CouponFilters.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onSearchSubmit: PropTypes.func.isRequired,
    discountTypeFilter: PropTypes.string.isRequired,
    onDiscountTypeChange: PropTypes.func.isRequired,
    sortBy: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired,
    totalCoupons: PropTypes.number.isRequired,
    onRefresh: PropTypes.func,
};

export default CouponFilters;
