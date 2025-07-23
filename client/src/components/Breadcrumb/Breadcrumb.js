import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ parentCategory, category }) => (
    <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        {parentCategory && (
            <>
                <span> / </span>
                <Link to={`/category/${parentCategory.slug}`}>{parentCategory.name}</Link>
            </>
        )}
        {category && (
            <>
                <span> / </span>
                <Link to={`/category/${parentCategory?.slug}/${category.slug}`}>
                    {category.name}
                </Link>
            </>
        )}
    </nav>
);

export default Breadcrumb;
