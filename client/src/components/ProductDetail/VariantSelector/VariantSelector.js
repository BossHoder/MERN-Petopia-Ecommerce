import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const VariantSelector = ({ variants = [], selectedVariant, onVariantChange }) => {
    const { t } = useI18n();

    // Group variants by attribute type for better organization
    const groupVariantsByAttribute = () => {
        const groups = {};

        variants.forEach((variant) => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    if (!groups[key]) {
                        groups[key] = new Set();
                    }
                    groups[key].add(value);
                });
            }
        });

        // Convert Sets to Arrays
        Object.keys(groups).forEach((key) => {
            groups[key] = Array.from(groups[key]);
        });

        return groups;
    };

    // Get variant by specific attribute combination
    const getVariantByAttributes = (attributeKey, attributeValue) => {
        return variants.find(
            (variant) => variant.attributes && variant.attributes[attributeKey] === attributeValue,
        );
    };

    // Check if variant is available (in stock and active)
    const isVariantAvailable = (variant) => {
        return (
            variant && variant.isActive !== false && (variant.stockQuantity || variant.stock) > 0
        );
    };

    // Get variant display name
    const getVariantDisplayName = (variant) => {
        if (variant.name) return variant.name;

        if (variant.attributes) {
            const attrs = Object.values(variant.attributes).filter(Boolean);
            if (attrs.length > 0) {
                return attrs.join(' / ');
            }
        }

        return t('product.variant', 'Variant');
    };

    // Get variant image for preview
    const getVariantImage = (variant) => {
        if (variant.images && variant.images.length > 0) {
            const image = variant.images[0];
            if (typeof image === 'string') {
                return image.startsWith('http')
                    ? image
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image}`;
            }
            return image?.url || image?.preview;
        }
        return null;
    };

    const attributeGroups = groupVariantsByAttribute();

    return (
        <div className="variant-selector">
            <h3 className="variant-selector-title">
                {t('product.selectVariant', 'Select Options')}
            </h3>

            {/* Attribute-based Selection */}
            {Object.keys(attributeGroups).length > 0 && (
                <div className="variant-attributes">
                    {Object.entries(attributeGroups).map(([attributeKey, values]) => (
                        <div key={attributeKey} className="variant-attribute-group">
                            <label className="variant-attribute-label">
                                {t(`product.attributes.${attributeKey}`, attributeKey)}:
                            </label>
                            <div className="variant-attribute-options">
                                {values.map((value) => {
                                    const variant = getVariantByAttributes(attributeKey, value);
                                    const isSelected =
                                        selectedVariant?.attributes?.[attributeKey] === value;
                                    const isAvailable = isVariantAvailable(variant);

                                    return (
                                        <button
                                            key={value}
                                            className={`variant-option ${
                                                isSelected ? 'selected' : ''
                                            } ${!isAvailable ? 'unavailable' : ''}`}
                                            onClick={() => isAvailable && onVariantChange(variant)}
                                            disabled={!isAvailable}
                                            title={
                                                !isAvailable
                                                    ? t('product.outOfStock', 'Out of stock')
                                                    : ''
                                            }
                                        >
                                            {/* Color swatch for color attributes */}
                                            {attributeKey.toLowerCase() === 'color' && (
                                                <div
                                                    className="color-swatch"
                                                    style={{ backgroundColor: value.toLowerCase() }}
                                                />
                                            )}
                                            <span className="variant-option-text">{value}</span>
                                            {!isAvailable && (
                                                <span className="unavailable-indicator">✕</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Variant List (fallback for complex variants) */}
            {Object.keys(attributeGroups).length === 0 && (
                <div className="variant-list">
                    {variants.map((variant, index) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const isAvailable = isVariantAvailable(variant);
                        const variantImage = getVariantImage(variant);

                        return (
                            <button
                                key={variant.id || index}
                                className={`variant-item ${isSelected ? 'selected' : ''} ${
                                    !isAvailable ? 'unavailable' : ''
                                }`}
                                onClick={() => isAvailable && onVariantChange(variant)}
                                disabled={!isAvailable}
                            >
                                {/* Variant Image */}
                                {variantImage && (
                                    <div className="variant-image">
                                        <img
                                            src={variantImage}
                                            alt={getVariantDisplayName(variant)}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Variant Info */}
                                <div className="variant-info">
                                    <div className="variant-name">
                                        {getVariantDisplayName(variant)}
                                    </div>
                                    <div className="variant-price">
                                        ${variant.price?.toFixed(2) || '0.00'}
                                    </div>
                                    <div className="variant-stock">
                                        {isAvailable ? (
                                            <span className="in-stock">
                                                {t('product.inStock', 'In Stock')} (
                                                {variant.stockQuantity || variant.stock || 0})
                                            </span>
                                        ) : (
                                            <span className="out-of-stock">
                                                {t('product.outOfStock', 'Out of Stock')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && <div className="selection-indicator">✓</div>}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Selected Variant Summary */}
            {selectedVariant && (
                <div className="selected-variant-summary">
                    <div className="summary-label">{t('product.selectedVariant', 'Selected')}:</div>
                    <div className="summary-content">
                        <span className="summary-name">
                            {getVariantDisplayName(selectedVariant)}
                        </span>
                        <span className="summary-price">
                            ${selectedVariant.price?.toFixed(2) || '0.00'}
                        </span>
                        <span className="summary-stock">
                            {(selectedVariant.stockQuantity || selectedVariant.stock || 0) > 0 ? (
                                <span className="in-stock">
                                    {selectedVariant.stockQuantity || selectedVariant.stock || 0}{' '}
                                    {t('product.available', 'available')}
                                </span>
                            ) : (
                                <span className="out-of-stock">
                                    {t('product.outOfStock', 'Out of Stock')}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Variant Images Preview */}
            {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 && (
                <div className="variant-images-preview">
                    <div className="preview-label">
                        {t('product.variantImages', 'Variant Images')}:
                    </div>
                    <div className="preview-images">
                        {selectedVariant.images.slice(0, 3).map((image, index) => (
                            <div key={index} className="preview-image">
                                <img
                                    src={getVariantImage({ images: [image] })}
                                    alt={`${getVariantDisplayName(selectedVariant)} ${index + 1}`}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.svg';
                                    }}
                                />
                            </div>
                        ))}
                        {selectedVariant.images.length > 3 && (
                            <div className="preview-more">+{selectedVariant.images.length - 3}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantSelector;
