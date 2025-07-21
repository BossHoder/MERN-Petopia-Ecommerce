import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={i} className="star filled">
                    ★
                </span>,
            );
        }

        if (hasHalfStar) {
            stars.push(
                <span key="half" className="star half">
                    ★
                </span>,
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="star empty">
                    ★
                </span>,
            );
        }

        return stars;
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.slug || product.id}`} className="product-card-link">
                <div className="product-image-container">
                    <img
                        src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                    />
                    {product.salePrice && (
                        <div className="discount-badge">
                            -
                            {product.discount ||
                                Math.round(
                                    ((product.price - product.salePrice) / product.price) * 100,
                                )}
                            %
                        </div>
                    )}
                    {!product.inStock && (
                        <div className="out-of-stock-overlay">
                            <span>{t('product.outOfStock', 'Hết hàng')}</span>
                        </div>
                    )}
                </div>

                <div className="product-info">
                    <div className="product-category">
                        {product.category?.name || product.category || ''}
                    </div>

                    <h3 className="product-name">{product.name}</h3>

                    <div className="product-brand">{product.brand}</div>

                    <div className="product-rating">
                        <div className="stars">{renderStars(product.ratings || 0)}</div>
                        <span className="rating-text">({product.numReviews || 0})</span>
                    </div>

                    <div className="product-pricing">
                        {product.salePrice ? (
                            <>
                                <span className="sale-price">{formatPrice(product.salePrice)}</span>
                                <span className="original-price">{formatPrice(product.price)}</span>
                            </>
                        ) : (
                            <span className="price">
                                {formatPrice(product.finalPrice || product.price)}
                            </span>
                        )}
                    </div>

                    {product.lowStock && product.inStock && (
                        <div className="low-stock-warning">
                            {t('product.lowStock', 'Chỉ còn lại ít sản phẩm')}
                        </div>
                    )}
                </div>
            </Link>

            <div className="product-actions">
                <button
                    className="add-to-cart-btn"
                    disabled={!product.inStock}
                    onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement add to cart functionality
                        console.log('Add to cart:', product.id);
                    }}
                >
                    {product.inStock
                        ? t('product.addToCart', 'Thêm vào giỏ')
                        : t('product.outOfStock', 'Hết hàng')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
