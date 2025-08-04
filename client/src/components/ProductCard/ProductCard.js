import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/displayUtils';
import './ProductCard.css';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/actions/cartActions';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

import analytics from '../../utils/analytics';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check if product has variants (for display purposes only)
    const hasNewVariantSystem = product?.variantAttributes && product.variantAttributes.length > 0;

    // Simple review count from database
    const getReviewCount = () => {
        return product.numReviews || 0;
    };

    // Use centralized price formatting function
    const formatPriceVND = (price) => {
        return formatPrice(price);
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

    // Handle add to cart - always add base product (no variants)
    const handleAddToCart = async () => {
        try {
            console.log('Add to cart product (base version):', product);
            // Add base product without any variant selections
            await dispatch(addToCart(product.id, 1, product));

            // Track add to cart event
            analytics.trackAddToCart({
                _id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                brand: product.brand,
                sku: product.sku,
                quantity: 1,
            });

            showSuccessToast(t('productCard.addedToCart', 'Added to cart successfully!'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            showErrorToast(
                t('productCard.addToCartError', 'Failed to add to cart. Please try again.'),
            );
        }
    };

    // Handle buy now - always buy base product (no variants)
    const handleBuyNow = async () => {
        try {
            console.log('Buy now product (base version):', product);
            // Add base product without any variant selections and navigate to cart
            await dispatch(addToCart(product.id, 1, product));
            navigate('/cart');
        } catch (error) {
            console.error('Error buying now:', error);
            showErrorToast(
                t('productCard.buyNowError', 'Failed to proceed to checkout. Please try again.'),
            );
        }
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
                        aria-label={t('productCard.addToWishlist')}
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
                    <div className="product-content">
                        <div className="product-category">
                            {product.category?.name || product.category || ''}
                        </div>
                        <h3 className="product-name">{product.name}</h3>
                        {product.brand && <div className="product-brand">{product.brand}</div>}

                        {/* Display available variants summary */}
                        {hasNewVariantSystem && product.variantAttributes && (
                            <div className="product-variants-summary">
                                {product.variantAttributes.slice(0, 2).map((attr, index) => (
                                    <div key={index} className="variant-summary">
                                        <span className="variant-label">
                                            {attr.displayName || attr.name}:
                                        </span>
                                        <span className="variant-count">
                                            {attr.values?.filter((v) => v.isActive).length || 0}{' '}
                                            {t('productCard.options', 'options')}
                                        </span>
                                    </div>
                                ))}
                                {product.variantAttributes.length > 2 && (
                                    <div className="more-variants">
                                        +{product.variantAttributes.length - 2}{' '}
                                        {t('productCard.more', 'more')}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="product-rating">
                            <div className="stars">{renderStars(product.ratings || 0)}</div>
                            <span className="rating-text">
                                ({getReviewCount()} {t('admin.productCard.reviews')})
                            </span>
                        </div>
                    </div>

                    <div className="product-actions">
                        <div className="product-price">
                            {product.salePrice ? (
                                <>
                                    <span className="current-price">
                                        {formatPriceVND(product.salePrice)}
                                    </span>
                                    <span className="original-price">
                                        {formatPriceVND(product.price)}
                                    </span>
                                </>
                            ) : (
                                <span className="current-price">
                                    {formatPriceVND(product.finalPrice || product.price)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Action Buttons - Outside Link to prevent event bubbling */}
            <div className="action-buttons">
                <button
                    className="add-to-cart-btn"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                >
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
                        ? t('products.addToCart', 'Add to Cart')
                        : t('productCard.outOfStock', 'Out of Stock')}
                </button>

                <button className="buy-now-btn" disabled={!product.inStock} onClick={handleBuyNow}>
                    <svg
                        className="lightning-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
                    </svg>
                    {product.inStock
                        ? t('productCard.buyNow', 'Buy Now')
                        : t('productCard.outOfStock', 'Out of Stock')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
