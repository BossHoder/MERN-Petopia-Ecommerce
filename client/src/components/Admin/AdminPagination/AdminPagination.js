import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const ChevronLeft = () => (
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
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRight = () => (
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
        <polyline points="9 6 15 12 9 18"></polyline>
    </svg>
);

const AdminPagination = ({ pagination, onPageChange, limit = 10 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useI18n();

    if (!pagination || pagination.totalPages <= 1) {
        return null;
    }

    const handlePageClick = (page) => {
        onPageChange(page);
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        params.set('limit', limit);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const { currentPage, totalPages } = pagination;

        if (currentPage > 3) {
            pages.push(
                <button key={1} onClick={() => handlePageClick(1)} className="admin-pagination-btn">
                    1
                </button>,
            );
            if (currentPage > 4) {
                pages.push(
                    <span key="ellipsis1" className="admin-pagination-ellipsis">
                        ...
                    </span>,
                );
            }
        }

        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);
        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={`admin-pagination-btn${currentPage === i ? ' active' : ''}`}
                >
                    {i}
                </button>,
            );
        }

        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(
                    <span key="ellipsis2" className="admin-pagination-ellipsis">
                        ...
                    </span>,
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageClick(totalPages)}
                    className="admin-pagination-btn"
                >
                    {totalPages}
                </button>,
            );
        }

        return pages;
    };

    return (
        <nav
            className="admin-pagination-container"
            aria-label={t('pagination.navigation', 'Pagination')}
        >
            <div className="admin-pagination-info">
                <span className="admin-pagination-text">
                    {t('pagination.showing', 'Showing')} {(pagination.currentPage - 1) * limit + 1}{' '}
                    -{' '}
                    {Math.min(
                        pagination.currentPage * limit,
                        pagination.totalItems ||
                            pagination.totalUsers ||
                            pagination.totalCategories ||
                            pagination.totalParentCategories ||
                            pagination.totalProducts,
                    )}{' '}
                    {t('pagination.of', 'of')}{' '}
                    {pagination.totalItems ||
                        pagination.totalUsers ||
                        pagination.totalCategories ||
                        pagination.totalParentCategories ||
                        pagination.totalProducts}{' '}
                    {t('pagination.results', 'results')}
                </span>
            </div>
            <div className="admin-pagination-nav">
                <button
                    onClick={() => handlePageClick(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="admin-pagination-arrow"
                    aria-label={t('pagination.previous', 'Previous page')}
                >
                    <ChevronLeft />
                </button>
                <div className="admin-pagination-pages">{renderPageNumbers()}</div>
                <button
                    onClick={() => handlePageClick(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="admin-pagination-arrow"
                    aria-label={t('pagination.next', 'Next page')}
                >
                    <ChevronRight />
                </button>
            </div>
        </nav>
    );
};

export default AdminPagination;
