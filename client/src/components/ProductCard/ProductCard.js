import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductCard.css';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/actions/cartActions';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

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

    const handleAddToWishlist = (e) => {
        e.preventDefault();
        // TODO: Implement wishlist logic
        console.log('Added to wishlist:', product.name);
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
                    <button
                        className="wishlist-btn"
                        onClick={handleAddToWishlist}
                        tabIndex={-1}
                        aria-label="Add to wishlist"
                    >
                        {/* Heart SVG */}
                        <svg
                            className="wishlist-icon"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>

                <div className="product-info">
                    <div className="product-category">
                        {product.category?.name || product.category || ''}
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    {product.brand && <div className="product-brand">{product.brand}</div>}
                    <div className="product-rating">
                        <div className="stars">{renderStars(product.ratings || 0)}</div>
                        <span className="rating-text">({product.numReviews || 0})</span>
                    </div>
                    <div className="product-price">
                        {product.salePrice ? (
                            <>
                                <span className="current-price">
                                    {formatPrice(product.salePrice)}
                                </span>
                                <span className="original-price">{formatPrice(product.price)}</span>
                            </>
                        ) : (
                            <span className="current-price">
                                {formatPrice(product.finalPrice || product.price)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
            <button
                className="add-to-cart-btn"
                disabled={!product.inStock}
                onClick={(e) => {
                    e.preventDefault();
                    console.log('Add to cart product:', product); // Debug product object
                    dispatch(addToCart(product.id, 1));
                }}
            >
                {/* Shopping cart SVG */}
                <svg
                    className="cart-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.59H6.5" />
                </svg>
                {product.inStock
                    ? t('products.addToCart', 'Thêm vào giỏ')
                    : t('products.outOfStock', 'Hết hàng')}
            </button>
        </div>
    );
};

export default ProductCard;
