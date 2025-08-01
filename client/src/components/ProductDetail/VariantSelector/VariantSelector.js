import React, { useState, useEffect } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import {
    getVariantDisplayName,
    isVariantAvailable,
    getVariantImage,
} from '../../../utils/variantUtils';
import './styles.css';

const VariantSelector = ({ variants = [], selectedVariant, onVariantChange }) => {
    const { t } = useI18n();
    const [selectedAttributes, setSelectedAttributes] = useState({});

    console.log('🔍 VariantSelector Debug:', {
        variantsCount: variants.length,
        variants,
        selectedVariant,
        hasOnVariantChange: typeof onVariantChange === 'function',
    });

    // Group variants by their name (attribute type) for dropdown organization
    const groupVariantsByName = () => {
        const groups = {};

        variants.forEach((variant) => {
            const attributeName = variant.name;
            if (!groups[attributeName]) {
                groups[attributeName] = [];
            }
            groups[attributeName].push(variant);
        });

        return groups;
    };

    // Find the selected variant based on current attribute selections
    const findSelectedVariant = () => {
        if (Object.keys(selectedAttributes).length === 0) return null;

        // For single attribute selection, find the variant that matches
        const entries = Object.entries(selectedAttributes);
        if (entries.length === 1) {
            const [attrName, attrValue] = entries[0];
            return variants.find(
                (variant) => variant.name === attrName && variant.value === attrValue,
            );
        }

        // For multiple attributes, this would need more complex logic
        // For now, return the first matching variant
        return variants.find((variant) => {
            return Object.entries(selectedAttributes).some(([attrName, attrValue]) => {
                return variant.name === attrName && variant.value === attrValue;
            });
        });
    };

    // Handle dropdown selection change
    const handleAttributeChange = (attributeName, value) => {
        const newSelections = { ...selectedAttributes };

        if (value === '') {
            // Remove selection if empty value
            delete newSelections[attributeName];
        } else {
            newSelections[attributeName] = value;
        }

        setSelectedAttributes(newSelections);

        // Find the variant that matches the new selection
        const matchingVariant = variants.find(
            (variant) => variant.name === attributeName && variant.value === value,
        );

        onVariantChange(matchingVariant || null);
    };

    // Update selected attributes when selectedVariant changes externally
    useEffect(() => {
        if (selectedVariant) {
            setSelectedAttributes({
                [selectedVariant.name]: selectedVariant.value,
            });
        } else {
            setSelectedAttributes({});
        }
    }, [selectedVariant]);

    // Check if variant is available (in stock and active) - enhanced version
    const isVariantAvailableEnhanced = (variant) => {
        return (
            variant && variant.isActive !== false && isVariantAvailable(variant) // Use imported function for stock check
        );
    };

    const variantGroups = groupVariantsByName();

    if (!variants || variants.length === 0) {
        return (
            <div className="variant-selector">
                <div className="variant-selector-header">
                    <h3 className="variant-selector-title">
                        {t('product.noVariants', 'No variants available')}
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className="variant-selector">
            <div className="variant-selector-header">
                <h3 className="variant-selector-title">
                    {t('product.selectVariant', 'Select Options')}
                </h3>
                {selectedVariant && (
                    <div className="selected-variant-info">
                        <span className="selected-variant-name">
                            {getVariantDisplayName(selectedVariant)}
                        </span>
                        <span className="selected-variant-price">
                            ${selectedVariant.price?.toFixed(2)}
                        </span>
                        <button
                            className="clear-selection-btn"
                            onClick={() => onVariantChange(null)}
                            title={t('product.clearSelection', 'Clear selection')}
                        >
                            {t('product.clearSelection', 'Clear')}
                        </button>
                    </div>
                )}
            </div>

            {/* Dropdown-based Selection */}
            <div className="variant-dropdowns">
                {Object.entries(variantGroups).map(([attributeName, attributeVariants]) => {
                    const currentSelection = selectedAttributes[attributeName] || '';

                    return (
                        <div key={attributeName} className="variant-dropdown-group">
                            <label
                                className="variant-dropdown-label"
                                htmlFor={`variant-${attributeName}`}
                            >
                                {t(`product.attributes.${attributeName}`, attributeName)}:
                            </label>
                            <select
                                id={`variant-${attributeName}`}
                                className="variant-dropdown"
                                value={currentSelection}
                                onChange={(e) =>
                                    handleAttributeChange(attributeName, e.target.value)
                                }
                                aria-label={`Select ${attributeName}`}
                            >
                                <option value="">
                                    {t('product.selectOption', `Select ${attributeName}`)}
                                </option>
                                {attributeVariants.map((variant) => {
                                    const isAvailable = isVariantAvailableEnhanced(variant);
                                    return (
                                        <option
                                            key={variant.value}
                                            value={variant.value}
                                            disabled={!isAvailable}
                                        >
                                            {variant.value} {!isAvailable ? '(Out of stock)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {/* Color swatch for color attributes */}
                            {attributeName.toLowerCase() === 'color' && currentSelection && (
                                <div className="color-swatch-display">
                                    <div
                                        className="color-swatch"
                                        style={{ backgroundColor: currentSelection.toLowerCase() }}
                                        title={currentSelection}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

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
