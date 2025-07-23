import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Pagination.css';

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
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const pages = [...Array(pagination.totalPages).keys()].map((i) => i + 1);

    return (
        <nav className="pagination-container">
            <ul className="pagination-list">
                {pages.map((page) => (
                    <li
                        key={page}
                        className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                    >
                        <button onClick={() => handlePageClick(page)} className="page-link">
                            {page}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;
