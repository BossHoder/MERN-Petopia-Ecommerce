import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const Pagination = ({ pagination, onPageChange }) => {
    const { t } = useTranslation();
    const { currentPage, totalPages, hasNext, hasPrev } = pagination;

    if (totalPages <= 1) {
        return null;
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            // Add first page if not in range
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('...');
                }
            }
            
            // Add pages in range
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // Add last page if not in range
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="pagination">
            <div className="pagination-info">
                {t('coupons.pageInfo', 'Page {{current}} of {{total}}', {
                    current: currentPage,
                    total: totalPages,
                })}
            </div>
            
            <div className="pagination-controls">
                {/* Previous Button */}
                <button
                    className={`pagination-btn prev ${!hasPrev ? 'disabled' : ''}`}
                    onClick={() => hasPrev && onPageChange(currentPage - 1)}
                    disabled={!hasPrev}
                    aria-label={t('coupons.previousPage', 'Previous page')}
                >
                    <i className="fas fa-chevron-left"></i>
                    <span className="btn-text">{t('coupons.previous', 'Previous')}</span>
                </button>

                {/* Page Numbers */}
                <div className="page-numbers">
                    {pageNumbers.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="pagination-ellipsis">...</span>
                            ) : (
                                <button
                                    className={`pagination-btn page-number ${
                                        page === currentPage ? 'active' : ''
                                    }`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={t('coupons.goToPage', 'Go to page {{page}}', { page })}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className={`pagination-btn next ${!hasNext ? 'disabled' : ''}`}
                    onClick={() => hasNext && onPageChange(currentPage + 1)}
                    disabled={!hasNext}
                    aria-label={t('coupons.nextPage', 'Next page')}
                >
                    <span className="btn-text">{t('coupons.next', 'Next')}</span>
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

Pagination.propTypes = {
    pagination: PropTypes.shape({
        currentPage: PropTypes.number.isRequired,
        totalPages: PropTypes.number.isRequired,
        hasNext: PropTypes.bool.isRequired,
        hasPrev: PropTypes.bool.isRequired,
    }).isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
