import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { generateSlug, validateSlug, createDebouncedSlugGenerator } from '../../utils/slugUtils';
import './SlugInput.css';

const SlugInput = ({
    nameValue,
    slugValue,
    onSlugChange,
    checkSlugExists,
    disabled = false,
    required = true,
    placeholder,
    className = '',
    showValidation = true,
    autoGenerate = true,
}) => {
    const { t } = useTranslation();

    // Local state
    const [localSlug, setLocalSlug] = useState(slugValue || '');
    const [isManuallyEdited, setIsManuallyEdited] = useState(false);
    const [validation, setValidation] = useState({ isValid: true, message: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);

    // Debounced slug generator
    const debouncedGenerateSlug = useCallback(
        createDebouncedSlugGenerator((generatedSlug) => {
            if (!isManuallyEdited && autoGenerate) {
                setLocalSlug(generatedSlug);
                onSlugChange(generatedSlug);
                setIsGenerating(false);
            }
        }, 300),
        [isManuallyEdited, autoGenerate, onSlugChange],
    );

    // Auto-generate slug from name when name changes
    useEffect(() => {
        if (nameValue && !isManuallyEdited && autoGenerate) {
            setIsGenerating(true);
            debouncedGenerateSlug(nameValue);
        }
    }, [nameValue, isManuallyEdited, autoGenerate, debouncedGenerateSlug]);

    // Update local slug when prop changes
    useEffect(() => {
        if (slugValue !== localSlug) {
            setLocalSlug(slugValue || '');
        }
    }, [slugValue]);

    // Validate slug when it changes
    useEffect(() => {
        if (localSlug && showValidation) {
            const validationResult = validateSlug(localSlug);
            setValidation(validationResult);

            // Check for duplicates if validation passes
            if (validationResult.isValid && checkSlugExists) {
                setIsDuplicateChecking(true);
                checkSlugExists(localSlug)
                    .then((exists) => {
                        if (exists) {
                            setValidation({
                                isValid: false,
                                message: t('admin.common.slugExists', 'This slug already exists'),
                            });
                        }
                    })
                    .catch((error) => {
                        console.warn('Error checking slug existence:', error);
                    })
                    .finally(() => {
                        setIsDuplicateChecking(false);
                    });
            }
        } else if (!localSlug && required && showValidation) {
            setValidation({
                isValid: false,
                message: t('admin.common.slugRequired', 'Slug is required'),
            });
        } else {
            setValidation({ isValid: true, message: '' });
        }
    }, [localSlug, showValidation, required, checkSlugExists, t]);

    // Handle manual slug input
    const handleSlugChange = (e) => {
        const newSlug = e.target.value;
        setLocalSlug(newSlug);
        setIsManuallyEdited(true);
        onSlugChange(newSlug);
    };

    // Handle regenerate button click
    const handleRegenerate = () => {
        if (nameValue) {
            const newSlug = generateSlug(nameValue);
            setLocalSlug(newSlug);
            setIsManuallyEdited(false);
            onSlugChange(newSlug);
        }
    };

    // Handle clear button click
    const handleClear = () => {
        setLocalSlug('');
        setIsManuallyEdited(false);
        onSlugChange('');
    };

    // Get input class names
    const getInputClassName = () => {
        let classes = ['slug-input'];

        if (className) {
            classes.push(className);
        }

        if (showValidation && !validation.isValid) {
            classes.push('error');
        }

        if (disabled) {
            classes.push('disabled');
        }

        return classes.join(' ');
    };

    return (
        <div className="slug-input-container">
            <div className="slug-input-wrapper">
                <div className="slug-input-group">
                    <input
                        type="text"
                        value={localSlug}
                        onChange={handleSlugChange}
                        placeholder={
                            placeholder ||
                            t('admin.common.slugPlaceholder', 'auto-generated-from-name')
                        }
                        className={getInputClassName()}
                        disabled={disabled}
                        aria-describedby="slug-help"
                    />

                    <div className="slug-input-actions">
                        {localSlug && (
                            <button
                                type="button"
                                className="slug-action-btn clear-btn"
                                onClick={handleClear}
                                disabled={disabled}
                                title={t('admin.common.clearSlug', 'Clear slug')}
                                aria-label={t('admin.common.clearSlug', 'Clear slug')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status indicators */}
                <div className="slug-status">
                    {isDuplicateChecking && (
                        <span className="slug-status-item checking">
                            <i className="fas fa-search"></i>
                            {t('admin.common.checkingSlug', 'Checking availability...')}
                        </span>
                    )}

                    {!isManuallyEdited && autoGenerate && !isGenerating && (
                        <span className="slug-status-item auto-generated">
                            <i className="fas fa-magic"></i>
                            {t('admin.common.autoGenerated', 'Auto-generated')}
                        </span>
                    )}
                </div>
            </div>

            {/* Validation message */}
            {showValidation && validation.message && (
                <div
                    className={`slug-validation-message ${
                        validation.isValid ? 'success' : 'error'
                    }`}
                >
                    <i
                        className={`fas ${
                            validation.isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'
                        }`}
                    ></i>
                    {validation.message}
                </div>
            )}

            {/* Help text */}
            <div id="slug-help" className="slug-help-text">
                {t(
                    'admin.common.slugHelpText',
                    'URL-friendly version of the name. Leave empty to auto-generate from name.',
                )}
            </div>
        </div>
    );
};

SlugInput.propTypes = {
    nameValue: PropTypes.string,
    slugValue: PropTypes.string,
    onSlugChange: PropTypes.func.isRequired,
    checkSlugExists: PropTypes.func,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    showValidation: PropTypes.bool,
    autoGenerate: PropTypes.bool,
};

export default SlugInput;
