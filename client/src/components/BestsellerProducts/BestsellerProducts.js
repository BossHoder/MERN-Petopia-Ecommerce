import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link
import { getBestsellers } from '../../store/actions/productActions';
import ProductCard from '../ProductCard/ProductCard';
import Loader from '../Loader/Loader';
import './BestsellerProducts.css';

const BestsellerProducts = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { bestsellers, bestsellersLoading, error } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(getBestsellers(4)); // Lấy 4 sản phẩm bán chạy
    }, [dispatch]);

    if (bestsellersLoading) {
        return (
            <section className="bestseller-products" id="featured-products">
                <div className="bestseller-container">
                    <Loader />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bestseller-products" id="featured-products">
                <div className="bestseller-container">
                    <div className="bestseller-error">{t('products.error')}</div>
                </div>
            </section>
        );
    }

    return (
        <section className="bestseller-products" id="featured-products">
            <div className="bestseller-container">
                <h2 className="bestseller-title">{t('products.bestsellers')}</h2>

                <div className="bestseller-grid">
                    {bestsellers.slice(0, 8).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BestsellerProducts;
