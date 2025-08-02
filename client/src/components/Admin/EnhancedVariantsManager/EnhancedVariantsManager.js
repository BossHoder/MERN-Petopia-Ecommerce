import React, { useState, useEffect } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import VariantImageUpload from '../VariantImageUpload';
import './styles.css';

const EnhancedVariantsManager = ({
    variantAttributes = [],
    variantCombinations = [],
    onVariantAttributesChange,
    onVariantCombinationsChange,
    basePrice = 0,
    baseSku = '',
    error = null,
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('attributes');
    const [expandedAttribute, setExpandedAttribute] = useState(null);
    const [expandedCombination, setExpandedCombination] = useState(null);

    // Generate all possible combinations when attributes change
    useEffect(() => {
        if (variantAttributes.length > 0) {
            generateCombinations();
        }
    }, [variantAttributes]);

    // Generate combination key from attributes
    const generateCombinationKey = (attributeSelections) => {
        const sortedKeys = Object.keys(attributeSelections).sort();
        return sortedKeys
            .map((key) => `${key}:${attributeSelections[key].toLowerCase()}`)
            .join(',');
    };

    // Generate SKU for combination
    const generateCombinationSku = (attributeSelections) => {
        const sortedKeys = Object.keys(attributeSelections).sort();
        const suffix = sortedKeys
            .map(
                (key) =>
                    `${key.charAt(0).toUpperCase()}${attributeSelections[key]
                        .charAt(0)
                        .toUpperCase()}`,
            )
            .join('');
        return `${baseSku}-${suffix}`;
    };

    // Generate all possible combinations
    const generateCombinations = () => {
        if (variantAttributes.length === 0) {
            onVariantCombinationsChange([]);
            return;
        }

        // Get active values for each attribute
        const attributeValues = variantAttributes.map((attr) => ({
            name: attr.name,
            values: attr.values.filter((v) => v.isActive).map((v) => v.value),
        }));

        // Generate cartesian product
        const combinations = [];

        const generateRecursive = (current, remaining) => {
            if (remaining.length === 0) {
                const combinationKey = generateCombinationKey(current);
                const sku = generateCombinationSku(current);

                // Check if combination already exists
                const existingCombination = variantCombinations.find(
                    (combo) => combo.combinationKey === combinationKey,
                );

                if (existingCombination) {
                    combinations.push(existingCombination);
                } else {
                    combinations.push({
                        combinationKey,
                        attributes: Object.keys(current).map((key) => ({
                            attributeName: key,
                            attributeValue: current[key],
                        })),
                        sku,
                        price: null, // Will use base price
                        salePrice: null,
                        stockQuantity: 0,
                        lowStockThreshold: 5,
                        images: [],
                        isActive: true,
                        weight: null,
                        dimensions: {},
                    });
                }
                return;
            }

            const [first, ...rest] = remaining;
            first.values.forEach((value) => {
                generateRecursive({ ...current, [first.name]: value }, rest);
            });
        };

        generateRecursive({}, attributeValues);
        onVariantCombinationsChange(combinations);
    };

    // Add new variant attribute
    const addVariantAttribute = () => {
        const newAttribute = {
            name: '',
            displayName: '',
            values: [{ value: '', displayName: '', colorCode: '', isActive: true }],
            isRequired: true,
            sortOrder: variantAttributes.length,
        };
        onVariantAttributesChange([...variantAttributes, newAttribute]);
        setExpandedAttribute(variantAttributes.length);
    };

    // Update variant attribute
    const updateVariantAttribute = (index, field, value) => {
        const updated = [...variantAttributes];
        updated[index] = { ...updated[index], [field]: value };
        onVariantAttributesChange(updated);
    };

    // Remove variant attribute
    const removeVariantAttribute = (index) => {
        const updated = variantAttributes.filter((_, i) => i !== index);
        onVariantAttributesChange(updated);
        if (expandedAttribute === index) {
            setExpandedAttribute(null);
        }
    };

    // Add value to attribute
    const addAttributeValue = (attributeIndex) => {
        const updated = [...variantAttributes];
        updated[attributeIndex].values.push({
            value: '',
            displayName: '',
            colorCode: '',
            isActive: true,
        });
        onVariantAttributesChange(updated);
    };

    // Update attribute value
    const updateAttributeValue = (attributeIndex, valueIndex, field, value) => {
        const updated = [...variantAttributes];
        updated[attributeIndex].values[valueIndex] = {
            ...updated[attributeIndex].values[valueIndex],
            [field]: value,
        };
        onVariantAttributesChange(updated);
    };

    // Remove attribute value
    const removeAttributeValue = (attributeIndex, valueIndex) => {
        const updated = [...variantAttributes];
        updated[attributeIndex].values = updated[attributeIndex].values.filter(
            (_, i) => i !== valueIndex,
        );
        onVariantAttributesChange(updated);
    };

    // Update variant combination
    const updateVariantCombination = (index, field, value) => {
        const updated = [...variantCombinations];
        updated[index] = { ...updated[index], [field]: value };
        onVariantCombinationsChange(updated);
    };

    // Format combination display name
    const formatCombinationName = (combination) => {
        return combination.attributes
            .map((attr) => `${attr.attributeName}: ${attr.attributeValue}`)
            .join(', ');
    };

    // Format price for display
    const formatPrice = (price) => {
        if (!price) return '';
        return price.toLocaleString('vi-VN');
    };

    return (
        <div className="enhanced-variants-manager">
            <div className="variants-manager-header">
                <h3>{t('admin.products.variants.title', 'Product Variants')}</h3>
                <div className="variants-tabs">
                    <button
                        type="button"
                        className={`tab-button ${activeTab === 'attributes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attributes')}
                    >
                        {t('admin.products.variants.attributes', 'Attributes')}
                    </button>
                    <button
                        type="button"
                        className={`tab-button ${activeTab === 'combinations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('combinations')}
                    >
                        {t('admin.products.variants.combinations', 'Combinations')} (
                        {variantCombinations.length})
                    </button>
                </div>
            </div>

            {error && <div className="variants-error">{error}</div>}

            {activeTab === 'attributes' && (
                <div className="attributes-tab">
                    <div className="tab-header">
                        <p className="tab-description">
                            {t(
                                'admin.products.variants.attributesDescription',
                                'Define variant attributes like Color, Size, Material, etc.',
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={addVariantAttribute}
                            className="add-attribute-btn"
                        >
                            + {t('admin.products.variants.addAttribute', 'Add Attribute')}
                        </button>
                    </div>

                    <div className="attributes-list">
                        {variantAttributes.map((attribute, index) => (
                            <div key={index} className="attribute-item">
                                <div className="attribute-header">
                                    <div className="attribute-info">
                                        <span className="attribute-name">
                                            {attribute.displayName ||
                                                attribute.name ||
                                                'New Attribute'}
                                        </span>
                                        <span className="attribute-values-count">
                                            ({attribute.values.filter((v) => v.isActive).length}{' '}
                                            values)
                                        </span>
                                    </div>
                                    <div className="attribute-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedAttribute(
                                                    expandedAttribute === index ? null : index,
                                                )
                                            }
                                            className="expand-btn"
                                        >
                                            {expandedAttribute === index ? '▼' : '▶'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeVariantAttribute(index)}
                                            className="remove-btn"
                                            title={t('common.remove', 'Remove')}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {expandedAttribute === index && (
                                    <div className="attribute-form">
                                        <div className="attribute-form-grid">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.attributeName',
                                                        'Attribute Name',
                                                    )}{' '}
                                                    *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={attribute.name || ''}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder="e.g., color, size, material"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.displayName',
                                                        'Display Name',
                                                    )}{' '}
                                                    *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={attribute.displayName || ''}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'displayName',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder="e.g., Màu sắc, Kích cỡ, Chất liệu"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.sortOrder',
                                                        'Sort Order',
                                                    )}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={attribute.sortOrder || 0}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'sortOrder',
                                                            parseInt(e.target.value),
                                                        )
                                                    }
                                                    className="form-input"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={attribute.isRequired !== false}
                                                        onChange={(e) =>
                                                            updateVariantAttribute(
                                                                index,
                                                                'isRequired',
                                                                e.target.checked,
                                                            )
                                                        }
                                                    />
                                                    {t(
                                                        'admin.products.variants.required',
                                                        'Required',
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="attribute-values">
                                            <div className="values-header">
                                                <h4>
                                                    {t('admin.products.variants.values', 'Values')}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => addAttributeValue(index)}
                                                    className="add-value-btn"
                                                >
                                                    +{' '}
                                                    {t(
                                                        'admin.products.variants.addValue',
                                                        'Add Value',
                                                    )}
                                                </button>
                                            </div>

                                            <div className="values-list">
                                                {attribute.values.map((value, valueIndex) => (
                                                    <div key={valueIndex} className="value-item">
                                                        <input
                                                            type="text"
                                                            value={value.value || ''}
                                                            onChange={(e) =>
                                                                updateAttributeValue(
                                                                    index,
                                                                    valueIndex,
                                                                    'value',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="value-input"
                                                            placeholder="Value (e.g., red, large)"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={value.displayName || ''}
                                                            onChange={(e) =>
                                                                updateAttributeValue(
                                                                    index,
                                                                    valueIndex,
                                                                    'displayName',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="value-input"
                                                            placeholder="Display name (e.g., Đỏ, Lớn)"
                                                        />
                                                        {attribute.name.toLowerCase() ===
                                                            'color' && (
                                                            <input
                                                                type="color"
                                                                value={value.colorCode || '#000000'}
                                                                onChange={(e) =>
                                                                    updateAttributeValue(
                                                                        index,
                                                                        valueIndex,
                                                                        'colorCode',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="color-input"
                                                                title="Color code"
                                                            />
                                                        )}
                                                        <label className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={value.isActive !== false}
                                                                onChange={(e) =>
                                                                    updateAttributeValue(
                                                                        index,
                                                                        valueIndex,
                                                                        'isActive',
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                            Active
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeAttributeValue(
                                                                    index,
                                                                    valueIndex,
                                                                )
                                                            }
                                                            className="remove-value-btn"
                                                            title={t('common.remove', 'Remove')}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {variantAttributes.length === 0 && (
                        <div className="empty-state">
                            <p>
                                {t(
                                    'admin.products.variants.noAttributes',
                                    'No variant attributes defined.',
                                )}
                            </p>
                            <p>
                                {t(
                                    'admin.products.variants.addAttributeHint',
                                    'Add attributes like Color, Size, Material to create product variants.',
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'combinations' && (
                <div className="combinations-tab">
                    <div className="tab-header">
                        <p className="tab-description">
                            {t(
                                'admin.products.variants.combinationsDescription',
                                'Manage stock, pricing, and images for each variant combination.',
                            )}
                        </p>
                        {variantAttributes.length > 0 && (
                            <button
                                type="button"
                                onClick={generateCombinations}
                                className="generate-combinations-btn"
                            >
                                🔄{' '}
                                {t('admin.products.variants.regenerate', 'Regenerate Combinations')}
                            </button>
                        )}
                    </div>

                    <div className="combinations-list">
                        {variantCombinations.map((combination, index) => (
                            <div key={combination.combinationKey} className="combination-item">
                                <div className="combination-header">
                                    <div className="combination-info">
                                        <span className="combination-name">
                                            {formatCombinationName(combination)}
                                        </span>
                                        <span className="combination-sku">
                                            SKU: {combination.sku}
                                        </span>
                                        <span className="combination-pricing">
                                            {combination.price ? (
                                                <>
                                                    {formatPrice(combination.price)}₫
                                                    {combination.salePrice && (
                                                        <span className="sale-price">
                                                            {' '}
                                                            → {formatPrice(combination.salePrice)}₫
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="base-price">
                                                    Base: {formatPrice(basePrice)}₫
                                                </span>
                                            )}
                                        </span>
                                        <span className="combination-stock">
                                            Stock: {combination.stockQuantity || 0}
                                        </span>
                                        <span
                                            className={`combination-status ${
                                                combination.isActive ? 'active' : 'inactive'
                                            }`}
                                        >
                                            {combination.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="combination-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedCombination(
                                                    expandedCombination === index ? null : index,
                                                )
                                            }
                                            className="expand-btn"
                                        >
                                            {expandedCombination === index ? '▼' : '▶'}
                                        </button>
                                    </div>
                                </div>

                                {expandedCombination === index && (
                                    <div className="combination-form">
                                        <div className="combination-form-grid">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('admin.products.variants.price', 'Price')}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={combination.price || ''}
                                                    onChange={(e) =>
                                                        updateVariantCombination(
                                                            index,
                                                            'price',
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : null,
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder={`Base price: ${basePrice.toLocaleString(
                                                        'vi-VN',
                                                    )}₫`}
                                                    min="0"
                                                    step="1"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.salePrice',
                                                        'Sale Price',
                                                    )}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={combination.salePrice || ''}
                                                    onChange={(e) =>
                                                        updateVariantCombination(
                                                            index,
                                                            'salePrice',
                                                            e.target.value
                                                                ? parseFloat(e.target.value)
                                                                : null,
                                                        )
                                                    }
                                                    className="form-input"
                                                    placeholder="Optional sale price"
                                                    min="0"
                                                    step="1"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.stockQuantity',
                                                        'Stock Quantity',
                                                    )}{' '}
                                                    *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={combination.stockQuantity || 0}
                                                    onChange={(e) =>
                                                        updateVariantCombination(
                                                            index,
                                                            'stockQuantity',
                                                            parseInt(e.target.value) || 0,
                                                        )
                                                    }
                                                    className="form-input"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t(
                                                        'admin.products.variants.lowStockThreshold',
                                                        'Low Stock Threshold',
                                                    )}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={combination.lowStockThreshold || 5}
                                                    onChange={(e) =>
                                                        updateVariantCombination(
                                                            index,
                                                            'lowStockThreshold',
                                                            parseInt(e.target.value) || 5,
                                                        )
                                                    }
                                                    className="form-input"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={combination.isActive}
                                                        onChange={(e) =>
                                                            updateVariantCombination(
                                                                index,
                                                                'isActive',
                                                                e.target.checked,
                                                            )
                                                        }
                                                    />
                                                    {t('admin.products.variants.active', 'Active')}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="combination-images">
                                            <label className="form-label">
                                                {t(
                                                    'admin.products.variants.images',
                                                    'Variant Images',
                                                )}
                                            </label>
                                            <VariantImageUpload
                                                images={combination.images || []}
                                                onImagesChange={(images) =>
                                                    updateVariantCombination(
                                                        index,
                                                        'images',
                                                        images,
                                                    )
                                                }
                                                maxImages={5}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {variantCombinations.length === 0 && (
                        <div className="empty-state">
                            {variantAttributes.length === 0 ? (
                                <p>
                                    {t(
                                        'admin.products.variants.noCombinationsNoAttributes',
                                        'Define variant attributes first to generate combinations.',
                                    )}
                                </p>
                            ) : (
                                <p>
                                    {t(
                                        'admin.products.variants.noCombinations',
                                        'No combinations generated yet. Click "Regenerate Combinations" to create them.',
                                    )}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedVariantsManager;
