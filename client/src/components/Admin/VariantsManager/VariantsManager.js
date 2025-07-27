import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import VariantImageUpload from '../VariantImageUpload';
import './styles.css';

const VariantsManager = ({ variants = [], onVariantsChange, basePrice = 0, error = null }) => {
    const { t } = useI18n();
    const [expandedVariant, setExpandedVariant] = useState(null);

    // Add new variant
    const addVariant = () => {
        const newVariant = {
            id: Date.now().toString(),
            name: '',
            sku: '',
            price: basePrice,
            stock: 0,
            attributes: {},
            images: [],
            isActive: true,
        };
        onVariantsChange([...variants, newVariant]);
        setExpandedVariant(variants.length); // Expand the new variant
    };

    // Remove variant
    const removeVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        onVariantsChange(updatedVariants);
        if (expandedVariant === index) {
            setExpandedVariant(null);
        } else if (expandedVariant > index) {
            setExpandedVariant(expandedVariant - 1);
        }
    };

    // Update variant
    const updateVariant = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            [field]: value,
        };
        onVariantsChange(updatedVariants);
    };

    // Update variant attribute
    const updateVariantAttribute = (index, attributeKey, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            attributes: {
                ...updatedVariants[index].attributes,
                [attributeKey]: value === '' ? undefined : value,
            },
        };
        onVariantsChange(updatedVariants);
    };

    // Update variant images
    const updateVariantImages = (index, images) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = {
            ...updatedVariants[index],
            images: images,
        };
        onVariantsChange(updatedVariants);
    };

    // Toggle variant expansion
    const toggleVariantExpansion = (index) => {
        setExpandedVariant(expandedVariant === index ? null : index);
    };

    // Generate SKU suggestion
    const generateSKU = (variant, index) => {
        const baseSKU = `VAR-${Date.now()}-${index + 1}`;
        return baseSKU;
    };

    return (
        <div className="variants-manager">
            <div className="variants-header">
                <label className="variants-label">
                    {t('admin.products.variants.title', 'Product Variants')}
                </label>
                <button type="button" onClick={addVariant} className="add-variant-btn">
                    ➕ {t('admin.products.variants.addVariant', 'Add Variant')}
                </button>
            </div>

            {error && <div className="variants-error">{error}</div>}

            {variants.length === 0 ? (
                <div className="no-variants">
                    <div className="no-variants-icon">📦</div>
                    <h3>{t('admin.products.variants.noVariants', 'No Variants Added')}</h3>
                    <p>
                        {t(
                            'admin.products.variants.noVariantsDesc',
                            'Add variants to offer different options like sizes, colors, or configurations.',
                        )}
                    </p>
                </div>
            ) : (
                <div className="variants-list">
                    {variants.map((variant, index) => (
                        <div key={variant.id || index} className="variant-card">
                            <div
                                className="variant-header"
                                onClick={() => toggleVariantExpansion(index)}
                            >
                                <div className="variant-summary">
                                    <div className="variant-title">
                                        <span className="variant-name">
                                            {variant.name ||
                                                t(
                                                    'admin.products.variants.unnamedVariant',
                                                    `Variant ${index + 1}`,
                                                )}
                                        </span>
                                        <span
                                            className={`variant-status ${
                                                variant.isActive ? 'active' : 'inactive'
                                            }`}
                                        >
                                            {variant.isActive
                                                ? t('common.active', 'Active')
                                                : t('common.inactive', 'Inactive')}
                                        </span>
                                    </div>
                                    <div className="variant-details">
                                        <span className="variant-price">
                                            ${variant.price?.toFixed(2) || '0.00'}
                                        </span>
                                        <span className="variant-stock">
                                            {t('admin.products.stock', 'Stock')}:{' '}
                                            {variant.stock || 0}
                                        </span>
                                        {variant.sku && (
                                            <span className="variant-sku">SKU: {variant.sku}</span>
                                        )}
                                        {variant.images && variant.images.length > 0 && (
                                            <div className="variant-image-thumbnails">
                                                <img
                                                    src={
                                                        variant.images[0].isNew
                                                            ? variant.images[0].preview
                                                            : typeof variant.images[0] === 'string'
                                                            ? variant.images[0]
                                                            : variant.images[0].url
                                                    }
                                                    alt="Variant thumbnail"
                                                    className="variant-image-thumbnail"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                {variant.images.length > 1 && (
                                                    <span className="variant-image-count">
                                                        +{variant.images.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="variant-actions">
                                    <button
                                        type="button"
                                        className="expand-btn"
                                        title={
                                            expandedVariant === index
                                                ? t('common.collapse', 'Collapse')
                                                : t('common.expand', 'Expand')
                                        }
                                    >
                                        {expandedVariant === index ? '▼' : '▶'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeVariant(index);
                                        }}
                                        className="remove-variant-btn"
                                        title={t('common.remove', 'Remove')}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {expandedVariant === index && (
                                <div className="variant-form">
                                    <div className="variant-form-grid">
                                        {/* Variant Name */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {t('admin.products.variants.name', 'Variant Name')}{' '}
                                                *
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.name || ''}
                                                onChange={(e) =>
                                                    updateVariant(index, 'name', e.target.value)
                                                }
                                                className="form-input"
                                                placeholder={t(
                                                    'admin.products.variants.namePlaceholder',
                                                    'e.g., Large Red, Small Blue',
                                                )}
                                            />
                                        </div>

                                        {/* SKU */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {t('admin.products.variants.sku', 'SKU')}
                                            </label>
                                            <div className="sku-input-group">
                                                <input
                                                    type="text"
                                                    value={variant.sku || ''}
                                                    onChange={(e) =>
                                                        updateVariant(index, 'sku', e.target.value)
                                                    }
                                                    className="form-input"
                                                    placeholder={t(
                                                        'admin.products.variants.skuPlaceholder',
                                                        'Unique identifier',
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateVariant(
                                                            index,
                                                            'sku',
                                                            generateSKU(variant, index),
                                                        )
                                                    }
                                                    className="generate-sku-btn"
                                                    title={t(
                                                        'admin.products.variants.generateSKU',
                                                        'Generate SKU',
                                                    )}
                                                >
                                                    🎲
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {t('admin.products.variants.price', 'Price')} *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={variant.price || ''}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'price',
                                                        parseFloat(e.target.value) || 0,
                                                    )
                                                }
                                                className="form-input"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        {/* Stock */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                {t('admin.products.variants.stock', 'Stock')} *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.stock || ''}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'stock',
                                                        parseInt(e.target.value) || 0,
                                                    )
                                                }
                                                className="form-input"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Attributes */}
                                    <div className="variant-attributes">
                                        <label className="form-label">
                                            {t(
                                                'admin.products.variants.attributes',
                                                'Variant Attributes',
                                            )}
                                        </label>
                                        <div className="attributes-grid">
                                            <div className="attribute-group">
                                                <label className="attribute-label">
                                                    {t('admin.products.variants.size', 'Size')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.attributes?.size || ''}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'size',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="attribute-input"
                                                    placeholder={t(
                                                        'admin.products.variants.sizePlaceholder',
                                                        'e.g., S, M, L, XL',
                                                    )}
                                                />
                                            </div>
                                            <div className="attribute-group">
                                                <label className="attribute-label">
                                                    {t('admin.products.variants.color', 'Color')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.attributes?.color || ''}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'color',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="attribute-input"
                                                    placeholder={t(
                                                        'admin.products.variants.colorPlaceholder',
                                                        'e.g., Red, Blue, Green',
                                                    )}
                                                />
                                            </div>
                                            <div className="attribute-group">
                                                <label className="attribute-label">
                                                    {t(
                                                        'admin.products.variants.material',
                                                        'Material',
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={variant.attributes?.material || ''}
                                                    onChange={(e) =>
                                                        updateVariantAttribute(
                                                            index,
                                                            'material',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="attribute-input"
                                                    placeholder={t(
                                                        'admin.products.variants.materialPlaceholder',
                                                        'e.g., Cotton, Leather',
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variant Images */}
                                    <div className="variant-images-section">
                                        <VariantImageUpload
                                            images={variant.images || []}
                                            onImagesChange={(images) =>
                                                updateVariantImages(index, images)
                                            }
                                            maxImages={3}
                                            variantName={variant.name}
                                            error={null}
                                        />
                                    </div>

                                    {/* Variant Status */}
                                    <div className="variant-status-section">
                                        <div className="form-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`variant-active-${index}`}
                                                checked={variant.isActive !== false}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'isActive',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="checkbox"
                                            />
                                            <label
                                                htmlFor={`variant-active-${index}`}
                                                className="checkbox-label"
                                            >
                                                {t(
                                                    'admin.products.variants.isActive',
                                                    'Active Variant',
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Variants Summary */}
            {variants.length > 0 && (
                <div className="variants-summary">
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-label">
                                {t('admin.products.variants.totalVariants', 'Total Variants')}
                            </span>
                            <span className="stat-value">{variants.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">
                                {t('admin.products.variants.activeVariants', 'Active')}
                            </span>
                            <span className="stat-value">
                                {variants.filter((v) => v.isActive !== false).length}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">
                                {t('admin.products.variants.totalStock', 'Total Stock')}
                            </span>
                            <span className="stat-value">
                                {variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">
                                {t('admin.products.variants.priceRange', 'Price Range')}
                            </span>
                            <span className="stat-value">
                                {variants.length > 0
                                    ? `$${Math.min(...variants.map((v) => v.price || 0)).toFixed(
                                          2,
                                      )} - $${Math.max(
                                          ...variants.map((v) => v.price || 0),
                                      ).toFixed(2)}`
                                    : '$0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantsManager;
