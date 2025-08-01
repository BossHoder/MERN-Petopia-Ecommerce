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

    // Parse comma-separated values and create individual options
    const parseVariantOptions = () => {
        const groups = {};

        variants.forEach((variant) => {
            const attributeName = variant.name;
            if (!groups[attributeName]) {
                groups[attributeName] = [];
            }

            // Check if the value contains comma-separated options
            if (variant.value && variant.value.includes(',')) {
                console.log(
                    `🔍 Parsing comma-separated variant: ${variant.name} = "${variant.value}"`,
                );

                // Split by comma and create separate options
                const options = variant.value
                    .split(',')
                    .map((option) => option.trim())
                    .filter((option) => option);

                console.log(`📝 Parsed options for ${variant.name}:`, options);

                options.forEach((option) => {
                    // Check if this option already exists to avoid duplicates
                    const existingOption = groups[attributeName].find(
                        (existing) => existing.value === option,
                    );

                    if (!existingOption) {
                        // Create a virtual variant for each option
                        groups[attributeName].push({
                            ...variant,
                            value: option,
                            originalValue: variant.value, // Keep reference to original
                            isParsedOption: true,
                        });
                        console.log(`✅ Added parsed option: ${attributeName} = "${option}"`);
                    } else {
                        console.log(`⚠️ Skipped duplicate option: ${attributeName} = "${option}"`);
                    }
                });
            } else {
                // Single value variant - check for duplicates
                const existingOption = groups[attributeName].find(
                    (existing) => existing.value === variant.value,
                );

                if (!existingOption) {
                    groups[attributeName].push({
                        ...variant,
                        originalValue: variant.value,
                        isParsedOption: false,
                    });
                }
            }
        });

        return groups;
    };

    // Find the original variant that contains the selected value
    const findOriginalVariant = (attributeName, selectedValue) => {
        return variants.find((variant) => {
            if (variant.name !== attributeName) return false;

            // Check if it's a direct match
            if (variant.value === selectedValue) return true;

            // Check if the selected value is part of a comma-separated list
            if (variant.value && variant.value.includes(',')) {
                const options = variant.value.split(',').map((option) => option.trim());
                return options.includes(selectedValue);
            }

            return false;
        });
    };

    // Handle dropdown selection change
    const handleAttributeChange = (attributeName, value) => {
        const newSelections = { ...selectedAttributes };

        if (value === '') {
            // Remove selection if empty value
            delete newSelections[attributeName];
            setSelectedAttributes(newSelections);
            onVariantChange(null);
        } else {
            newSelections[attributeName] = value;
            setSelectedAttributes(newSelections);

            // Find the original variant that contains this value
            const originalVariant = findOriginalVariant(attributeName, value);

            if (originalVariant) {
                // Create a variant object with the selected specific value
                const selectedVariant = {
                    ...originalVariant,
                    value: value, // Use the specific selected value
                    selectedOption: value, // Keep track of what was selected
                    originalValue: originalVariant.value, // Keep the original comma-separated value
                };

                onVariantChange(selectedVariant);
            } else {
                onVariantChange(null);
            }
        }
    };

    // Update selected attributes when selectedVariant changes externally
    useEffect(() => {
        if (selectedVariant) {
            // Use the selectedOption if available, otherwise use value
            const valueToUse = selectedVariant.selectedOption || selectedVariant.value;
            setSelectedAttributes({
                [selectedVariant.name]: valueToUse,
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

    const variantGroups = parseVariantOptions();

    // Debug logging
    console.log('🔍 Parsed variant groups:', variantGroups);

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
                                {attributeVariants.map((variant, index) => {
                                    const isAvailable = isVariantAvailableEnhanced(variant);
                                    const uniqueKey = `${attributeName}-${variant.value}-${index}`;
                                    return (
                                        <option
                                            key={uniqueKey}
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
