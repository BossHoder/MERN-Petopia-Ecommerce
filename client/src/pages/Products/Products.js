import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../store/actions/productActions';
import Loader from '../../components/Loader/Loader';
import ProductCard from '../../components/ProductCard/ProductCard';
import Sidebar from './Sidebar'; // Component con cho bộ lọc
import Pagination from './Pagination'; // Component con cho phân trang
import './Products.css';

const Products = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const { products, pagination, productsLoading, error } = useSelector((state) => state.products);

    useEffect(() => {
        // Lấy tất cả query params từ URL để gọi API
        const params = new URLSearchParams(location.search);
        const queryFilters = Object.fromEntries(params.entries());

        dispatch(getAllProducts(queryFilters));
    }, [dispatch, location.search]);

    const handleFilterChange = (newFilters) => {
        const params = new URLSearchParams(location.search);

        // Cập nhật params với filter mới, xóa nếu giá trị rỗng
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key]) {
                params.set(key, newFilters[key]);
            } else {
                params.delete(key);
            }
        });

        // Reset về trang 1 khi filter thay đổi
        params.set('page', '1');

        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <div className="products-page-container">
            <Sidebar onFilterChange={handleFilterChange} />
            <div className="products-main-content">
                <div className="products-header">
                    <h1>Our Products</h1>
                    {/* Component sắp xếp có thể thêm vào đây */}
                </div>
                {productsLoading ? (
                    <Loader />
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        <Pagination pagination={pagination} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;
