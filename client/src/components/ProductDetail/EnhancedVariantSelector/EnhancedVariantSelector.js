import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import api from '../../../services/api';
import './styles.css';

const EnhancedVariantSelector = ({
    product,
    onVariantChange,
    onPriceChange,
    onStockChange,
    disabled = false,
}) => {
    const { t } = useI18n();
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [availableOptions, setAvailableOptions] = useState({});
    const [currentCombination, setCurrentCombination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if product has the new variant system
    const hasNewVariantSystem = product?.variantAttributes && product.variantAttributes.length > 0;

    // Calculate available options based on current selections and product data
    const calculateAvailableOptions = useCallback(
        (selections = {}) => {
            if (!hasNewVariantSystem || !product?.variantAttributes) return {};

            console.log('🔍 Calculating available options for selections:', selections);
            console.log('📊 Product variant attributes:', product.variantAttributes);
            console.log('🔗 Product variant combinations:', product.variantCombinations);

            const options = {};

            // For each attribute, determine which values are available
            product.variantAttributes.forEach((attribute) => {
                const attributeName = attribute.name;
                const availableValues = [];

                // Get all active values for this attribute
                attribute.values.forEach((value) => {
                    if (!value.isActive) return;

                    // Check if this value is compatible with current selections
                    const testSelections = { ...selections, [attributeName]: value.value };

                    // Find if there's at least one combination that matches these selections
                    const hasCompatibleCombination = product.variantCombinations?.some(
                        (combination) => {
                            if (!combination.isActive) return false;

                            return combination.attributes.every((attr) => {
                                const selectedValue = testSelections[attr.attributeName];
                                return !selectedValue || selectedValue === attr.attributeValue;
                            });
                        },
                    );

                    if (hasCompatibleCombination) {
                        availableValues.push({
                            value: value.value,
                            displayName: value.displayName,
                            colorCode: value.colorCode,
                        });
                    }
                });

                options[attributeName] = availableValues;
            });

            console.log('✅ Calculated available options:', options);
            return options;
        },
        [hasNewVariantSystem, product?.variantAttributes, product?.variantCombinations],
    );

    // Find combination details from local data
    const findCombinationDetails = useCallback(
        (attributes) => {
            if (
                !hasNewVariantSystem ||
                !product?.variantCombinations ||
                Object.keys(attributes).length === 0
            ) {
                setCurrentCombination(null);
                return null;
            }

            console.log('🔍 Finding combination for attributes:', attributes);

            // Find the matching combination
            const combination = product.variantCombinations.find((combo) => {
                if (!combo.isActive) return false;

                // Check if all selected attributes match this combination
                return combo.attributes.every((attr) => {
                    const selectedValue = attributes[attr.attributeName];
                    return selectedValue === attr.attributeValue;
                });
            });

            console.log('✅ Found combination:', combination);

            if (combination) {
                setCurrentCombination(combination);

                // Update parent component with combination details
                onVariantChange?.(combination);
                onPriceChange?.(
                    combination.salePrice ||
                        combination.price ||
                        product?.salePrice ||
                        product?.price,
                );
                onStockChange?.(combination.stockQuantity || 0);
            } else {
                setCurrentCombination(null);
                onVariantChange?.(null);
                onPriceChange?.(product?.salePrice || product?.price);
                onStockChange?.(product?.stockQuantity);
            }

            return combination;
        },
        [
            hasNewVariantSystem,
            product?.variantCombinations,
            product?.salePrice,
            product?.price,
            product?.stockQuantity,
            onVariantChange,
            onPriceChange,
            onStockChange,
        ],
    );

    // Initialize component
    useEffect(() => {
        if (hasNewVariantSystem) {
            const options = calculateAvailableOptions({});
            setAvailableOptions(options);
        } else {
            // Handle legacy variant system or products without variants
            onVariantChange?.(null);
            onPriceChange?.(product?.salePrice || product?.price);
            onStockChange?.(product?.stockQuantity);
        }
    }, [
        hasNewVariantSystem,
        calculateAvailableOptions,
        product,
        onVariantChange,
        onPriceChange,
        onStockChange,
    ]);

    // Handle attribute selection
    const handleAttributeChange = useCallback(
        (attributeName, value) => {
            if (disabled) return;

            const newSelections = { ...selectedAttributes };

            if (value === '' || value === null) {
                delete newSelections[attributeName];
            } else {
                newSelections[attributeName] = value;
            }

            setSelectedAttributes(newSelections);

            // Update available options
            const options = calculateAvailableOptions(newSelections);
            setAvailableOptions(options);

            // Check if all required attributes are selected
            const requiredAttributes = product.variantAttributes.filter((attr) => attr.isRequired);
            const allRequiredSelected = requiredAttributes.every(
                (attr) => newSelections[attr.name],
            );

            if (allRequiredSelected) {
                // Find combination details
                findCombinationDetails(newSelections);
            } else {
                // Clear combination if not all required attributes are selected
                setCurrentCombination(null);
                onVariantChange?.(null);
                onPriceChange?.(product?.salePrice || product?.price);
                onStockChange?.(product?.stockQuantity);
            }
        },
        [
            disabled,
            selectedAttributes,
            calculateAvailableOptions,
            findCombinationDetails,
            product,
            onVariantChange,
            onPriceChange,
            onStockChange,
        ],
    );

    // Clear all selections
    const clearSelections = useCallback(() => {
        if (disabled) return;

        setSelectedAttributes({});
        setCurrentCombination(null);
        onVariantChange?.(null);
        onPriceChange?.(product?.salePrice || product?.price);
        onStockChange?.(product?.stockQuantity);

        const options = calculateAvailableOptions({});
        setAvailableOptions(options);
    }, [
        disabled,
        onVariantChange,
        onPriceChange,
        onStockChange,
        product,
        calculateAvailableOptions,
    ]);

    // Check if all required attributes are selected
    const allRequiredSelected =
        hasNewVariantSystem && product.variantAttributes
            ? product.variantAttributes
                  .filter((attr) => attr.isRequired)
                  .every((attr) => selectedAttributes[attr.name])
            : true;

    // Render color swatch for color attributes
    const renderColorSwatch = (colorValue, colorCode) => {
        if (!colorCode) return null;

        return (
            <div
                className="color-swatch"
                style={{ backgroundColor: colorCode }}
                title={colorValue}
            />
        );
    };

    // Don't render if product doesn't have new variant system
    if (!hasNewVariantSystem) {
        return null;
    }

    return (
        <div className={`enhanced-variant-selector ${disabled ? 'disabled' : ''}`}>
            <div className="variant-selector-header">
                <h3 className="variant-selector-title">
                    {t('product.selectVariant', 'Select Options')}
                </h3>

                {Object.keys(selectedAttributes).length > 0 && (
                    <button
                        className="clear-selections-btn"
                        onClick={clearSelections}
                        disabled={disabled}
                        title={t('product.clearSelections', 'Clear all selections')}
                    >
                        {t('product.clearAll', 'Clear All')}
                    </button>
                )}
            </div>

            {error && <div className="variant-error">{error}</div>}

            <div className="variant-attributes">
                {product.variantAttributes
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((attribute) => {
                        const currentSelection = selectedAttributes[attribute.name] || '';
                        const availableValues = availableOptions[attribute.name] || [];
                        const hasAvailableOptions = availableValues.length > 0;

                        return (
                            <div key={attribute.name} className="variant-attribute-group">
                                <label className="variant-attribute-label">
                                    {attribute.displayName || attribute.name}
                                    {attribute.isRequired && (
                                        <span className="required-indicator">*</span>
                                    )}
                                </label>

                                <select
                                    className={`variant-attribute-select ${
                                        !hasAvailableOptions ? 'no-options' : ''
                                    }`}
                                    value={currentSelection}
                                    onChange={(e) =>
                                        handleAttributeChange(attribute.name, e.target.value)
                                    }
                                    disabled={disabled || loading || !hasAvailableOptions}
                                >
                                    <option value="">
                                        {loading
                                            ? t('product.loading', 'Loading...')
                                            : t(
                                                  'product.selectOption',
                                                  `Select ${
                                                      attribute.displayName || attribute.name
                                                  }`,
                                              )}
                                    </option>

                                    {availableValues.map((valueObj, index) => (
                                        <option
                                            key={`${valueObj.value}-${index}`}
                                            value={valueObj.value}
                                        >
                                            {valueObj.displayName || valueObj.value}
                                        </option>
                                    ))}
                                </select>

                                {/* Color swatch display */}
                                {attribute.name.toLowerCase() === 'color' && currentSelection && (
                                    <div className="color-swatch-display">
                                        {(() => {
                                            const selectedValue = availableValues.find(
                                                (v) => v.value === currentSelection,
                                            );
                                            return renderColorSwatch(
                                                currentSelection,
                                                selectedValue?.colorCode,
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Show unavailable message */}
                                {!hasAvailableOptions && !loading && (
                                    <div className="no-options-message">
                                        {t(
                                            'product.noOptionsAvailable',
                                            'No options available for current selection',
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>

            {/* Selection summary */}
            {currentCombination && (
                <div className="selection-summary">
                    <div className="selected-combination">
                        <span className="combination-label">
                            {t('product.selectedVariant', 'Selected:')}
                        </span>
                        <span className="combination-details">
                            {currentCombination.attributes
                                .map((attr) => {
                                    const attrDef = product.variantAttributes.find(
                                        (va) => va.name === attr.attributeName,
                                    );
                                    const valueDef = attrDef?.values.find(
                                        (v) => v.value === attr.attributeValue,
                                    );
                                    return `${attrDef?.displayName || attr.attributeName}: ${
                                        valueDef?.displayName || attr.attributeValue
                                    }`;
                                })
                                .join(', ')}
                        </span>
                    </div>

                    <div className="combination-info">
                        <span className="combination-price">
                            ${currentCombination.effectivePrice?.toFixed(2)}
                        </span>

                        <span
                            className={`combination-stock ${
                                currentCombination.isLowStock ? 'low-stock' : ''
                            }`}
                        >
                            {currentCombination.inStock
                                ? `${currentCombination.stockQuantity} ${t(
                                      'product.inStock',
                                      'in stock',
                                  )}`
                                : t('product.outOfStock', 'Out of stock')}
                        </span>
                    </div>
                </div>
            )}

            {/* Validation message */}
            {!allRequiredSelected && Object.keys(selectedAttributes).length > 0 && (
                <div className="validation-message">
                    {t(
                        'product.selectAllRequired',
                        'Please select all required options to continue',
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedVariantSelector;
