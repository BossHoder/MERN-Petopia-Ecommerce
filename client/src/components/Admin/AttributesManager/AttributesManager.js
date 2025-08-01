import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const AttributesManager = ({ attributes = {}, onAttributesChange, error = null }) => {
    const { t } = useI18n();
    const [customAttributes, setCustomAttributes] = useState(attributes.custom || []);

    // Predefined attribute options
    const petTypeOptions = [
        { value: '', label: t('admin.products.attributes.selectPetType', 'Select pet type') },
        { value: 'dog', label: t('admin.products.attributes.dog', 'Dog') },
        { value: 'cat', label: t('admin.products.attributes.cat', 'Cat') },
        { value: 'dog and cat', label: t('admin.products.attributes.dogAndCat', 'Dog and Cat') },
    ];

    const ageGroupOptions = [
        { value: '', label: t('admin.products.attributes.selectAgeGroup', 'Select age group') },
        { value: 'puppy', label: t('admin.products.attributes.puppy', 'Puppy/Kitten') },
        { value: 'adult', label: t('admin.products.attributes.adult', 'Adult') },
        { value: 'senior', label: t('admin.products.attributes.senior', 'Senior') },
        { value: 'all', label: t('admin.products.attributes.all', 'All Ages') },
    ];

    // Handle predefined attribute changes
    const handleAttributeChange = (key, value) => {
        const updatedAttributes = {
            ...attributes,
            [key]: value === '' ? undefined : value,
        };
        onAttributesChange(updatedAttributes);
    };

    // Handle dimension changes
    const handleDimensionChange = (dimension, value) => {
        const updatedAttributes = {
            ...attributes,
            dimensions: {
                ...attributes.dimensions,
                [dimension]: value === '' ? undefined : parseFloat(value) || undefined,
            },
        };
        onAttributesChange(updatedAttributes);
    };

    // Handle custom attribute changes
    const handleCustomAttributeChange = (index, field, value) => {
        const updatedCustom = [...customAttributes];
        updatedCustom[index] = {
            ...updatedCustom[index],
            [field]: value,
        };
        setCustomAttributes(updatedCustom);

        const updatedAttributes = {
            ...attributes,
            custom: updatedCustom.filter((attr) => attr.key && attr.value),
        };
        onAttributesChange(updatedAttributes);
    };

    // Add new custom attribute
    const addCustomAttribute = () => {
        const newCustom = [...customAttributes, { key: '', value: '' }];
        setCustomAttributes(newCustom);
    };

    // Remove custom attribute
    const removeCustomAttribute = (index) => {
        const updatedCustom = customAttributes.filter((_, i) => i !== index);
        setCustomAttributes(updatedCustom);

        const updatedAttributes = {
            ...attributes,
            custom: updatedCustom.filter((attr) => attr.key && attr.value),
        };
        onAttributesChange(updatedAttributes);
    };

    return (
        <div className="attributes-manager">
            <label className="attributes-label">
                {t('admin.products.attributes.title', 'Product Attributes')}
            </label>

            {error && <div className="attributes-error">{error}</div>}

            <div className="attributes-grid">
                {/* Pet Type */}
                <div className="attribute-group">
                    <label className="attribute-label">
                        {t('admin.products.attributes.petType', 'Pet Type')}
                    </label>
                    <select
                        value={attributes.petType || ''}
                        onChange={(e) => handleAttributeChange('petType', e.target.value)}
                        className="attribute-select"
                    >
                        {petTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Age Group */}
                <div className="attribute-group">
                    <label className="attribute-label">
                        {t('admin.products.attributes.ageGroup', 'Age Group')}
                    </label>
                    <select
                        value={attributes.ageGroup || ''}
                        onChange={(e) => handleAttributeChange('ageGroup', e.target.value)}
                        className="attribute-select"
                    >
                        {ageGroupOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Weight */}
                <div className="attribute-group">
                    <label className="attribute-label">
                        {t('admin.products.attributes.weight', 'Weight (kg)')}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={attributes.weight || ''}
                        onChange={(e) =>
                            handleAttributeChange(
                                'weight',
                                e.target.value === '' ? undefined : parseFloat(e.target.value),
                            )
                        }
                        className="attribute-input"
                        placeholder="0.00"
                    />
                </div>

                {/* Color */}
                <div className="attribute-group">
                    <label className="attribute-label">
                        {t('admin.products.attributes.color', 'Color')}
                    </label>
                    <input
                        type="text"
                        value={attributes.color || ''}
                        onChange={(e) => handleAttributeChange('color', e.target.value)}
                        className="attribute-input"
                        placeholder={t(
                            'admin.products.attributes.colorPlaceholder',
                            'e.g., Red, Blue, Multi-color',
                        )}
                    />
                </div>

                {/* Material */}
                <div className="attribute-group">
                    <label className="attribute-label">
                        {t('admin.products.attributes.material', 'Material')}
                    </label>
                    <input
                        type="text"
                        value={attributes.material || ''}
                        onChange={(e) => handleAttributeChange('material', e.target.value)}
                        className="attribute-input"
                        placeholder={t(
                            'admin.products.attributes.materialPlaceholder',
                            'e.g., Cotton, Plastic, Metal',
                        )}
                    />
                </div>
            </div>

            {/* Dimensions */}
            <div className="dimensions-section">
                <label className="attribute-label">
                    {t('admin.products.attributes.dimensions', 'Dimensions (cm)')}
                </label>
                <div className="dimensions-grid">
                    <div className="dimension-group">
                        <label className="dimension-label">
                            {t('admin.products.attributes.length', 'Length')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={attributes.dimensions?.length || ''}
                            onChange={(e) => handleDimensionChange('length', e.target.value)}
                            className="dimension-input"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="dimension-group">
                        <label className="dimension-label">
                            {t('admin.products.attributes.width', 'Width')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={attributes.dimensions?.width || ''}
                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                            className="dimension-input"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="dimension-group">
                        <label className="dimension-label">
                            {t('admin.products.attributes.height', 'Height')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={attributes.dimensions?.height || ''}
                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                            className="dimension-input"
                            placeholder="0.0"
                        />
                    </div>
                </div>
            </div>

            {/* Custom Attributes */}
            <div className="custom-attributes-section">
                <div className="custom-attributes-header">
                    <label className="attribute-label">
                        {t('admin.products.attributes.custom', 'Custom Attributes')}
                    </label>
                    <button
                        type="button"
                        onClick={addCustomAttribute}
                        className="add-attribute-btn"
                    >
                        ➕ {t('admin.products.attributes.addCustom', 'Add Custom')}
                    </button>
                </div>

                {customAttributes.map((attr, index) => (
                    <div key={index} className="custom-attribute-row">
                        <input
                            type="text"
                            value={attr.key || ''}
                            onChange={(e) =>
                                handleCustomAttributeChange(index, 'key', e.target.value)
                            }
                            className="custom-attribute-key"
                            placeholder={t(
                                'admin.products.attributes.keyPlaceholder',
                                'Attribute name',
                            )}
                        />
                        <input
                            type="text"
                            value={attr.value || ''}
                            onChange={(e) =>
                                handleCustomAttributeChange(index, 'value', e.target.value)
                            }
                            className="custom-attribute-value"
                            placeholder={t(
                                'admin.products.attributes.valuePlaceholder',
                                'Attribute value',
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => removeCustomAttribute(index)}
                            className="remove-attribute-btn"
                            title={t('common.remove', 'Remove')}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {customAttributes.length === 0 && (
                    <div className="no-custom-attributes">
                        <p>
                            {t('admin.products.attributes.noCustom', 'No custom attributes added')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttributesManager;
