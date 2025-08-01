import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    generateSlug,
    validateSlug,
    createDebouncedSlugGenerator,
    generateSku,
    validateSku,
    createDebouncedSkuGenerator,
} from '../../utils/slugUtils';
import './SlugSkuInput.css';

const SlugSkuInput = ({
    nameValue,
    slugValue,
    skuValue,
    onSlugChange,
    onSkuChange,
    checkSlugExists,
    checkSkuExists,
    disabled = false,
    required = true,
    showValidation = true,
    autoGenerateSlug = true,
    autoGenerateSku = false,
    className = '',
}) => {
    const { t } = useTranslation();

    // Local state for slug
    const [localSlug, setLocalSlug] = useState(slugValue || '');
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [slugValidation, setSlugValidation] = useState({ isValid: true, message: '' });
    const [isSlugGenerating, setIsSlugGenerating] = useState(false);
    const [isSlugDuplicateChecking, setIsSlugDuplicateChecking] = useState(false);
    const [lastGeneratedSlug, setLastGeneratedSlug] = useState('');

    // Local state for SKU
    const [localSku, setLocalSku] = useState(skuValue || '');
    const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);
    const [skuValidation, setSkuValidation] = useState({ isValid: true, message: '' });
    const [isSkuGenerating, setIsSkuGenerating] = useState(false);
    const [isSkuDuplicateChecking, setIsSkuDuplicateChecking] = useState(false);
    const [lastGeneratedSku, setLastGeneratedSku] = useState('');
    const [lastNameValue, setLastNameValue] = useState('');

    // Debounced generators
    const debouncedGenerateSlug = useCallback(
        createDebouncedSlugGenerator((generatedSlug) => {
            if (!isSlugManuallyEdited && autoGenerateSlug) {
                setLocalSlug(generatedSlug);
                setLastGeneratedSlug(generatedSlug);
                onSlugChange && onSlugChange(generatedSlug);
                setIsSlugGenerating(false);
            }
        }, 300),
        [isSlugManuallyEdited, autoGenerateSlug, onSlugChange],
    );

    const debouncedGenerateSku = useCallback(
        createDebouncedSkuGenerator((generatedSku) => {
            if (!isSkuManuallyEdited && autoGenerateSku) {
                setLocalSku(generatedSku);
                setLastGeneratedSku(generatedSku);
                onSkuChange && onSkuChange(generatedSku);
                setIsSkuGenerating(false);
            }
        }, 300),
        [isSkuManuallyEdited, autoGenerateSku, onSkuChange],
    );

    // Auto-generate slug from name when name changes
    useEffect(() => {
        // Only generate if name actually changed and hasn't been manually edited
        if (nameValue && nameValue !== lastNameValue && !isSlugManuallyEdited && autoGenerateSlug) {
            setIsSlugGenerating(true);
            debouncedGenerateSlug(nameValue);
        }
        setLastNameValue(nameValue);
    }, [nameValue, lastNameValue, isSlugManuallyEdited, autoGenerateSlug, debouncedGenerateSlug]);

    // Auto-generate SKU from name when name changes
    useEffect(() => {
        // Only generate if name actually changed and hasn't been manually edited
        if (nameValue && nameValue !== lastNameValue && !isSkuManuallyEdited && autoGenerateSku) {
            setIsSkuGenerating(true);
            debouncedGenerateSku(nameValue);
        }
    }, [nameValue, lastNameValue, isSkuManuallyEdited, autoGenerateSku, debouncedGenerateSku]);

    // Update local slug when prop changes (without triggering manual edit flag)
    useEffect(() => {
        if (slugValue !== localSlug) {
            setLocalSlug(slugValue || '');
            // Don't mark as manually edited when prop changes
            if (slugValue) {
                setLastGeneratedSlug(slugValue);
            }
        }
    }, [slugValue, localSlug]);

    // Update local SKU when prop changes (without triggering manual edit flag)
    useEffect(() => {
        if (skuValue !== localSku) {
            setLocalSku(skuValue || '');
            // Don't mark as manually edited when prop changes
            if (skuValue) {
                setLastGeneratedSku(skuValue);
            }
        }
    }, [skuValue, localSku]);

    // Validate slug when it changes
    useEffect(() => {
        if (localSlug && showValidation && autoGenerateSlug) {
            const validationResult = validateSlug(localSlug);
            setSlugValidation(validationResult);

            // Check for duplicates if validation passes
            if (validationResult.isValid && checkSlugExists) {
                setIsSlugDuplicateChecking(true);
                checkSlugExists(localSlug)
                    .then((exists) => {
                        if (exists) {
                            setSlugValidation({
                                isValid: false,
                                message: t('admin.common.slugExists', 'This slug already exists'),
                            });
                        }
                    })
                    .catch((error) => {
                        console.warn('Error checking slug existence:', error);
                    })
                    .finally(() => {
                        setIsSlugDuplicateChecking(false);
                    });
            }
        } else if (!localSlug && required && showValidation && autoGenerateSlug) {
            setSlugValidation({
                isValid: false,
                message: t('admin.common.slugRequired', 'Slug is required'),
            });
        } else {
            setSlugValidation({ isValid: true, message: '' });
        }
    }, [localSlug, showValidation, required, checkSlugExists, t, autoGenerateSlug]);

    // Validate SKU when it changes
    useEffect(() => {
        if (localSku && showValidation && autoGenerateSku) {
            const validationResult = validateSku(localSku);
            setSkuValidation(validationResult);

            // Check for duplicates if validation passes
            if (validationResult.isValid && checkSkuExists) {
                setIsSkuDuplicateChecking(true);
                checkSkuExists(localSku)
                    .then((exists) => {
                        if (exists) {
                            setSkuValidation({
                                isValid: false,
                                message: t('admin.common.skuExists', 'This SKU already exists'),
                            });
                        }
                    })
                    .catch((error) => {
                        console.warn('Error checking SKU existence:', error);
                    })
                    .finally(() => {
                        setIsSkuDuplicateChecking(false);
                    });
            }
        } else if (!localSku && required && showValidation && autoGenerateSku) {
            setSkuValidation({
                isValid: false,
                message: t('admin.common.skuRequired', 'SKU is required'),
            });
        } else {
            setSkuValidation({ isValid: true, message: '' });
        }
    }, [localSku, showValidation, required, checkSkuExists, t, autoGenerateSku]);

    // Handle manual slug input
    const handleSlugChange = (e) => {
        const newSlug = e.target.value;
        setLocalSlug(newSlug);
        // Only mark as manually edited if the user actually typed something different from auto-generated
        if (newSlug !== lastGeneratedSlug) {
            setIsSlugManuallyEdited(true);
        }
        onSlugChange && onSlugChange(newSlug);
    };

    // Handle manual SKU input
    const handleSkuChange = (e) => {
        const newSku = e.target.value.toUpperCase(); // Force uppercase for SKU
        setLocalSku(newSku);
        // Only mark as manually edited if the user actually typed something different from auto-generated
        if (newSku !== lastGeneratedSku) {
            setIsSkuManuallyEdited(true);
        }
        onSkuChange && onSkuChange(newSku);
    };

    // Handle regenerate slug button click
    const handleRegenerateSlug = () => {
        if (nameValue) {
            const newSlug = generateSlug(nameValue);
            setLocalSlug(newSlug);
            setLastGeneratedSlug(newSlug);
            setIsSlugManuallyEdited(false);
            onSlugChange && onSlugChange(newSlug);
        }
    };

    // Handle regenerate SKU button click
    const handleRegenerateSku = () => {
        if (nameValue) {
            const newSku = generateSku(nameValue);
            setLocalSku(newSku);
            setLastGeneratedSku(newSku);
            setIsSkuManuallyEdited(false);
            onSkuChange && onSkuChange(newSku);
        }
    };

    // Handle clear slug button click
    const handleClearSlug = () => {
        setLocalSlug('');
        setLastGeneratedSlug('');
        setIsSlugManuallyEdited(false);
        onSlugChange && onSlugChange('');
    };

    // Handle clear SKU button click
    const handleClearSku = () => {
        setLocalSku('');
        setLastGeneratedSku('');
        setIsSkuManuallyEdited(false);
        onSkuChange && onSkuChange('');
    };

    // Get input class names
    const getInputClassName = (hasError) => {
        let classes = ['slug-sku-input'];

        if (className) {
            classes.push(className);
        }

        if (showValidation && hasError) {
            classes.push('error');
        }

        if (disabled) {
            classes.push('disabled');
        }

        return classes.join(' ');
    };

    return (
        <div className="slug-sku-input-container">
            {/* Slug Input */}
            {autoGenerateSlug && (
                <div className="slug-sku-input-wrapper">
                    <label htmlFor="slug" className="slug-sku-label">
                        {t('admin.products.slug', 'Slug')}
                    </label>
                    <div className="slug-sku-input-group">
                        <input
                            type="text"
                            id="slug"
                            value={localSlug}
                            onChange={handleSlugChange}
                            placeholder={t(
                                'admin.common.slugPlaceholder',
                                'auto-generated-from-name',
                            )}
                            className={getInputClassName(!slugValidation.isValid)}
                            disabled={disabled}
                            aria-describedby="slug-help"
                        />

                        <div className="slug-sku-input-actions">
                            {nameValue && (
                                <button
                                    type="button"
                                    className="slug-sku-action-btn regenerate-btn"
                                    onClick={handleRegenerateSlug}
                                    disabled={disabled || isSlugGenerating}
                                    title={t('admin.common.regenerateSlug', 'Regenerate from name')}
                                    aria-label={t(
                                        'admin.common.regenerateSlug',
                                        'Regenerate from name',
                                    )}
                                >
                                    <i
                                        className={`fas ${
                                            isSlugGenerating ? 'fa-spinner fa-spin' : 'fa-sync-alt'
                                        }`}
                                    ></i>
                                </button>
                            )}

                            {localSlug && (
                                <button
                                    type="button"
                                    className="slug-sku-action-btn clear-btn"
                                    onClick={handleClearSlug}
                                    disabled={disabled}
                                    title={t('admin.common.clearSlug', 'Clear slug')}
                                    aria-label={t('admin.common.clearSlug', 'Clear slug')}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Slug Status indicators */}
                    <div className="slug-sku-status">
                        {isSlugGenerating && (
                            <span className="slug-sku-status-item generating">
                                <i className="fas fa-spinner fa-spin"></i>
                                {t('admin.common.generatingSlug', 'Generating...')}
                            </span>
                        )}

                        {isSlugDuplicateChecking && (
                            <span className="slug-sku-status-item checking">
                                <i className="fas fa-search"></i>
                                {t('admin.common.checkingSlug', 'Checking availability...')}
                            </span>
                        )}

                        {!isSlugManuallyEdited && autoGenerateSlug && !isSlugGenerating && (
                            <span className="slug-sku-status-item auto-generated">
                                <i className="fas fa-magic"></i>
                                {t('admin.common.autoGenerated', 'Auto-generated')}
                            </span>
                        )}
                    </div>

                    {/* Slug Validation message */}
                    {showValidation && slugValidation.message && (
                        <div
                            className={`slug-sku-validation-message ${
                                slugValidation.isValid ? 'success' : 'error'
                            }`}
                        >
                            <i
                                className={`fas ${
                                    slugValidation.isValid
                                        ? 'fa-check-circle'
                                        : 'fa-exclamation-triangle'
                                }`}
                            ></i>
                            {slugValidation.message}
                        </div>
                    )}

                    {/* Slug Help text */}
                    <div id="slug-help" className="slug-sku-help-text">
                        {t(
                            'admin.common.slugHelpText',
                            'URL-friendly version of the name. Leave empty to auto-generate from name.',
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

SlugSkuInput.propTypes = {
    nameValue: PropTypes.string,
    slugValue: PropTypes.string,
    skuValue: PropTypes.string,
    onSlugChange: PropTypes.func,
    onSkuChange: PropTypes.func,
    checkSlugExists: PropTypes.func,
    checkSkuExists: PropTypes.func,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    showValidation: PropTypes.bool,
    autoGenerateSlug: PropTypes.bool,
    autoGenerateSku: PropTypes.bool,
    className: PropTypes.string,
};

export default SlugSkuInput;
