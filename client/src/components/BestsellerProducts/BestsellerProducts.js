import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getBestsellers } from '../../store/actions/productActions';
import ProductCard from '../ProductCard/ProductCard';
import Loader from '../Loader/Loader';
import './BestsellerProducts.css';

const BestsellerProducts = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { bestsellers, bestsellersLoading, error } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(getBestsellers(8)); // Lấy 8 sản phẩm bán chạy
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
                    <div className="bestseller-error">
                        {t('products.error', 'Không thể tải sản phẩm. Vui lòng thử lại sau.')}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bestseller-products" id="featured-products">
            <div className="bestseller-container">
                <div className="bestseller-header">
                    <h2 className="bestseller-title">
                        {t('products.bestsellers', 'Sản Phẩm Bán Chạy')}
                    </h2>
                    <p className="bestseller-subtitle">
                        {t(
                            'products.bestsellers.subtitle',
                            'Những sản phẩm được yêu thích nhất bởi các pet parents',
                        )}
                    </p>
                </div>

                <div className="bestseller-grid">
                    {bestsellers.slice(0, 8).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="bestseller-footer">
                    <button className="view-all-button">
                        {t('products.viewAll', 'Xem Tất Cả Sản Phẩm')}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BestsellerProducts;
