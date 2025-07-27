import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    createParentCategory,
    updateParentCategory,
    clearAdminErrors
} from '../../../store/actions/adminActions';
import API from '../../../services/api';

const ParentCategoryForm = ({ mode, parentCategoryId, onClose, onSuccess }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        parentCategoryCreateLoading,
        parentCategoryUpdateLoading,
        error
    } = useSelector(state => state.admin);

    // Validation schema based on server model
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, t('validation.parentCategory.nameMin', 'Name must be at least 2 characters'))
            .max(100, t('validation.parentCategory.nameMax', 'Name cannot exceed 100 characters'))
            .required(t('validation.parentCategory.nameRequired', 'Name is required')),
        
        slug: Yup.string()
            .matches(/^[a-z0-9-]+$/, t('validation.parentCategory.slugPattern', 'Slug can only contain lowercase letters, numbers, and hyphens'))
            .min(2, t('validation.parentCategory.slugMin', 'Slug must be at least 2 characters'))
            .max(100, t('validation.parentCategory.slugMax', 'Slug cannot exceed 100 characters')),
        
        description: Yup.string()
            .max(500, t('validation.parentCategory.descriptionMax', 'Description cannot exceed 500 characters'))
            .required(t('validation.parentCategory.descriptionRequired', 'Description is required')),
        
        image: Yup.string()
            .url(t('validation.parentCategory.imageUrl', 'Please enter a valid image URL'))
            .required(t('validation.parentCategory.imageRequired', 'Image URL is required')),
        
        isPublished: Yup.boolean(),
        sortOrder: Yup.number().integer().min(0)
    });

    // Load existing data for edit mode
    useEffect(() => {
        if (mode === 'edit' && parentCategoryId) {
            const loadParentCategory = async () => {
                try {
                    setLoading(true);
                    const response = await API.get(`/api/admin/parent-categories/${parentCategoryId}`);
                    setInitialData(response.data.data.parentCategory);
                } catch (error) {
                    toast.error(t('admin.parentCategories.loadError', 'Failed to load parent category data'));
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            loadParentCategory();
        }
    }, [mode, parentCategoryId, onClose, t]);

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (mode === 'addnew') {
                await dispatch(createParentCategory(values));
                toast.success(t('admin.parentCategories.createSuccess', 'Parent category created successfully'));
            } else {
                await dispatch(updateParentCategory(parentCategoryId, values));
                toast.success(t('admin.parentCategories.updateSuccess', 'Parent category updated successfully'));
            }
            onSuccess();
        } catch (error) {
            // Error is handled by Redux and displayed via toast in parent component
        } finally {
            setSubmitting(false);
        }
    };

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const initialValues = initialData || {
        name: '',
        slug: '',
        description: '',
        image: '',
        isPublished: true,
        sortOrder: 0
    };

    if (loading) {
        return (
            <div className="admin-form-container">
                <div className="admin-form-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            <div className="admin-form-header">
                <h2>
                    {mode === 'addnew' 
                        ? t('admin.parentCategories.addNew', 'Add New Parent Category')
                        : t('admin.parentCategories.edit', 'Edit Parent Category')
                    }
                </h2>
                <button className="admin-form-close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                    <Form className="admin-form">
                        <div className="admin-form-grid">
                            {/* Name Field */}
                            <div className="admin-form-group">
                                <label htmlFor="name" className="admin-form-label">
                                    {t('admin.parentCategories.name', 'Name')} *
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`admin-form-input ${errors.name && touched.name ? 'error' : ''}`}
                                    placeholder={t('admin.parentCategories.namePlaceholder', 'Enter parent category name')}
                                    onChange={(e) => {
                                        setFieldValue('name', e.target.value);
                                        // Auto-generate slug if it's empty or matches the previous name
                                        if (!values.slug || values.slug === generateSlug(values.name)) {
                                            setFieldValue('slug', generateSlug(e.target.value));
                                        }
                                    }}
                                />
                                <ErrorMessage name="name" component="div" className="admin-form-error" />
                            </div>

                            {/* Slug Field */}
                            <div className="admin-form-group">
                                <label htmlFor="slug" className="admin-form-label">
                                    {t('admin.parentCategories.slug', 'Slug')}
                                </label>
                                <Field
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    className={`admin-form-input ${errors.slug && touched.slug ? 'error' : ''}`}
                                    placeholder={t('admin.parentCategories.slugPlaceholder', 'URL-friendly version (auto-generated)')}
                                />
                                <ErrorMessage name="slug" component="div" className="admin-form-error" />
                                <div className="admin-form-help">
                                    {t('admin.parentCategories.slugHelp', 'Leave empty to auto-generate from name')}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="admin-form-group admin-form-group-full">
                                <label htmlFor="description" className="admin-form-label">
                                    {t('admin.parentCategories.description', 'Description')} *
                                </label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    className={`admin-form-textarea ${errors.description && touched.description ? 'error' : ''}`}
                                    placeholder={t('admin.parentCategories.descriptionPlaceholder', 'Describe this parent category...')}
                                />
                                <ErrorMessage name="description" component="div" className="admin-form-error" />
                            </div>

                            {/* Image URL Field */}
                            <div className="admin-form-group admin-form-group-full">
                                <label htmlFor="image" className="admin-form-label">
                                    {t('admin.parentCategories.image', 'Image URL')} *
                                </label>
                                <Field
                                    type="url"
                                    id="image"
                                    name="image"
                                    className={`admin-form-input ${errors.image && touched.image ? 'error' : ''}`}
                                    placeholder={t('admin.parentCategories.imagePlaceholder', 'https://example.com/image.jpg')}
                                />
                                <ErrorMessage name="image" component="div" className="admin-form-error" />
                                {values.image && (
                                    <div className="admin-form-image-preview">
                                        <img src={values.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>

                            {/* Status and Sort Order */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    {t('admin.parentCategories.status', 'Status')}
                                </label>
                                <div className="admin-form-checkbox">
                                    <Field
                                        type="checkbox"
                                        id="isPublished"
                                        name="isPublished"
                                        className="admin-checkbox"
                                    />
                                    <label htmlFor="isPublished" className="admin-checkbox-label">
                                        {t('admin.parentCategories.published', 'Published')}
                                    </label>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="sortOrder" className="admin-form-label">
                                    {t('admin.parentCategories.sortOrder', 'Sort Order')}
                                </label>
                                <Field
                                    type="number"
                                    id="sortOrder"
                                    name="sortOrder"
                                    min="0"
                                    className={`admin-form-input ${errors.sortOrder && touched.sortOrder ? 'error' : ''}`}
                                    placeholder="0"
                                />
                                <ErrorMessage name="sortOrder" component="div" className="admin-form-error" />
                                <div className="admin-form-help">
                                    {t('admin.parentCategories.sortOrderHelp', 'Lower numbers appear first')}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="admin-form-actions">
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary"
                                disabled={isSubmitting || parentCategoryCreateLoading || parentCategoryUpdateLoading}
                            >
                                {isSubmitting 
                                    ? t('common.saving', 'Saving...')
                                    : mode === 'addnew' 
                                        ? t('admin.parentCategories.create', 'Create Parent Category')
                                        : t('admin.parentCategories.update', 'Update Parent Category')
                                }
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ParentCategoryForm;
