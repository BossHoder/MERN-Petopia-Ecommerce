import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const ProductInfo = ({
    product,
    selectedVariant,
    currentPrice,
    currentStock,
    isInStock,
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
}) => {
    const { t } = useI18n();

    // Calculate discount percentage if there's a variant price difference
    const getDiscountPercentage = () => {
        if (selectedVariant && product.price && selectedVariant.price < product.price) {
            return Math.round(((product.price - selectedVariant.price) / product.price) * 100);
        }
        return 0;
    };

    // Format price with currency
    const formatPrice = (price) => {
        return `$${price?.toFixed(2) || '0.00'}`;
    };

    // Get stock status text and class
    const getStockStatus = () => {
        if (currentStock === 0) {
            return {
                text: t('product.outOfStock', 'Out of Stock'),
                className: 'out-of-stock',
            };
        } else if (currentStock <= 5) {
            return {
                text: t('product.lowStock', `Only ${currentStock} left in stock`),
                className: 'low-stock',
            };
        } else {
            return {
                text: t('product.inStock', 'In Stock'),
                className: 'in-stock',
            };
        }
    };

    const stockStatus = getStockStatus();
    const discountPercentage = getDiscountPercentage();

    return (
        <div className="product-info">
            {/* Product Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Product Brand */}
            {product.brand && (
                <div className="product-brand">
                    <span className="brand-label">{t('product.brand', 'Brand')}:</span>
                    <span className="brand-name">{product.brand}</span>
                </div>
            )}

            {/* Price, Quantity and Stock Row */}
            <div className="price-quantity-row">
                {/* Price Section */}
                <div className="product-price-section">
                    <div className="price-main">
                        <span className="current-price">{formatPrice(currentPrice)}</span>

                        {/* Original price if there's a discount */}
                        {discountPercentage > 0 && (
                            <span className="original-price">{formatPrice(product.price)}</span>
                        )}

                        {/* Discount badge */}
                        {discountPercentage > 0 && (
                            <span className="discount-badge">-{discountPercentage}%</span>
                        )}
                    </div>

                    {/* Price per unit if applicable */}
                    {product.unit && (
                        <div className="price-per-unit">
                            {formatPrice(currentPrice)} {t('product.per', 'per')} {product.unit}
                        </div>
                    )}
                </div>

                {/* Quantity Selector */}
                {isInStock && (
                    <div className="quantity-section">
                        <label className="quantity-label">
                            {t('product.quantity', 'Quantity')}:
                        </label>
                        <div className="quantity-controls">
                            <button
                                className="quantity-btn decrease"
                                onClick={() => onQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                aria-label={t('product.decreaseQuantity', 'Decrease quantity')}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                className="quantity-input"
                                value={quantity}
                                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                                min="1"
                                max={currentStock}
                            />
                            <button
                                className="quantity-btn increase"
                                onClick={() => onQuantityChange(quantity + 1)}
                                disabled={quantity >= currentStock}
                                aria-label={t('product.increaseQuantity', 'Increase quantity')}
                            >
                                +
                            </button>
                        </div>
                        <div className="quantity-info">
                            {t('product.maxQuantity', 'Tối đa')}: {currentStock}
                        </div>
                    </div>
                )}

                {/* Stock Status */}
                <div className={`stock-status ${stockStatus.className}`}>
                    <span className="stock-icon">{isInStock ? '✓' : '✕'}</span>
                    <span className="stock-text">{stockStatus.text}</span>
                </div>
            </div>

            {/* Product Rating (if available) */}
            {product.rating && (
                <div className="product-rating">
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${star <= product.rating ? 'filled' : ''}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="rating-value">({product.rating}/5)</span>
                    {product.reviewCount && (
                        <span className="review-count">
                            {product.reviewCount} {t('product.reviews', 'reviews')}
                        </span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
                {isInStock ? (
                    <>
                        <button className="btn btn-primary add-to-cart-btn" onClick={onAddToCart}>
                            <span className="btn-icon">🛒</span>
                            {t('product.addToCart', 'Add to Cart')}
                        </button>
                        <button className="btn btn-secondary buy-now-btn" onClick={onBuyNow}>
                            <span className="btn-icon">⚡</span>
                            {t('product.buyNow', 'Buy Now')}
                        </button>
                    </>
                ) : (
                    <button className="btn btn-disabled out-of-stock-btn" disabled>
                        <span className="btn-icon">✕</span>
                        {t('product.outOfStock', 'Out of Stock')}
                    </button>
                )}

                {/* Wishlist Button */}
                <button className="btn btn-outline wishlist-btn">
                    <span className="btn-icon">♡</span>
                    {t('product.addToWishlist', 'Add to Wishlist')}
                </button>
            </div>

            {/* Product Features/Benefits */}
            {product.features && product.features.length > 0 && (
                <div className="product-features">
                    <h3 className="features-title">{t('product.features', 'Key Features')}</h3>
                    <ul className="features-list">
                        {product.features.map((feature, index) => (
                            <li key={index} className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span className="feature-text">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProductInfo;
