import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Pagination.css';

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

const Pagination = ({ pagination, onPageChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!pagination || pagination.totalPages <= 1) {
        return null;
    }

    const handlePageClick = (page) => {
        onPageChange(page);
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        // Ensure limit=4 is always set for consistent pagination
        if (!params.has('limit')) {
            params.set('limit', '4');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const { currentPage, totalPages } = pagination;

        if (currentPage > 3) {
            pages.push(
                <button key={1} onClick={() => handlePageClick(1)} className="pagination-btn">
                    1
                </button>,
            );
            if (currentPage > 4) {
                pages.push(
                    <span key="ellipsis1" className="pagination-ellipsis">
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
                    className={`pagination-btn${currentPage === i ? ' active' : ''}`}
                >
                    {i}
                </button>,
            );
        }

        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(
                    <span key="ellipsis2" className="pagination-ellipsis">
                        ...
                    </span>,
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageClick(totalPages)}
                    className="pagination-btn"
                >
                    {totalPages}
                </button>,
            );
        }
        return pages;
    };

    return (
        <nav className="pagination-container" aria-label="Pagination">
            <div className="pagination-nav">
                <button
                    onClick={() => handlePageClick(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="pagination-arrow"
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                </button>
                <div className="pagination-pages">{renderPageNumbers()}</div>
                <button
                    onClick={() => handlePageClick(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="pagination-arrow"
                    aria-label="Next page"
                >
                    <ChevronRight />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;
