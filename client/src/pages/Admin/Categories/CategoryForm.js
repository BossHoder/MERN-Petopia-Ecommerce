import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    createCategory,
    updateCategory,
    clearAdminErrors,
} from '../../../store/actions/adminActions';
import { fetchParentCategories } from '../../../store/actions/categoryActions';
import SlugInput from '../../../components/SlugInput/SlugInput';
import API from '../../../services/api';

const CategoryForm = ({ mode, categoryId, onClose, onSuccess }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check if category slug exists
    const checkCategorySlugExists = async (slug) => {
        if (!slug || slug === initialData?.slug) return false;

        try {
            const response = await API.get(`/api/admin/categories/check-slug/${slug}`);
            return response.data.data.exists;
        } catch (error) {
            console.warn('Error checking category slug:', error);
            return false;
        }
    };

    const { categoryCreateLoading, categoryUpdateLoading, error } = useSelector(
        (state) => state.admin,
    );

    const { parentCategories } = useSelector((state) => state.categories);

    // Validation schema based on server model
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, t('validation.category.nameMin', 'Name must be at least 2 characters'))
            .max(100, t('validation.category.nameMax', 'Name cannot exceed 100 characters'))
            .required(t('validation.category.nameRequired', 'Name is required')),

        slug: Yup.string()
            .matches(
                /^[a-z0-9-]+$/,
                t(
                    'validation.category.slugPattern',
                    'Slug can only contain lowercase letters, numbers, and hyphens',
                ),
            )
            .min(2, t('validation.category.slugMin', 'Slug must be at least 2 characters'))
            .max(100, t('validation.category.slugMax', 'Slug cannot exceed 100 characters')),

        parentCategory: Yup.string().required(
            t('validation.category.parentCategoryRequired', 'Parent category is required'),
        ),

        iconUrl: Yup.string()
            .url(t('validation.category.iconUrl', 'Please enter a valid icon URL'))
            .required(t('validation.category.iconRequired', 'Icon URL is required')),

        description: Yup.string().max(
            500,
            t('validation.category.descriptionMax', 'Description cannot exceed 500 characters'),
        ),

        isPublished: Yup.boolean(),
        sortOrder: Yup.number().integer().min(0),
    });

    // Load parent categories
    useEffect(() => {
        dispatch(fetchParentCategories());
    }, [dispatch]);

    // Load existing data for edit mode
    useEffect(() => {
        if (mode === 'edit' && categoryId) {
            const loadCategory = async () => {
                try {
                    setLoading(true);
                    const response = await API.get(`/api/admin/categories/${categoryId}`);
                    setInitialData(response.data.data.category);
                } catch (error) {
                    toast.error(t('admin.categories.loadError', 'Failed to load category data'));
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            loadCategory();
        }
    }, [mode, categoryId, onClose, t]);

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (mode === 'addnew') {
                await dispatch(createCategory(values));
                toast.success(t('admin.categories.createSuccess', 'Category created successfully'));
            } else {
                await dispatch(updateCategory(categoryId, values));
                toast.success(t('admin.categories.updateSuccess', 'Category updated successfully'));
            }
            onSuccess();
        } catch (error) {
            // Error is handled by Redux and displayed via toast in parent component
        } finally {
            setSubmitting(false);
        }
    };

    // Slug will be handled by SlugInput component

    const initialValues = initialData || {
        name: '',
        slug: '',
        parentCategory: '',
        iconUrl: '',
        description: '',
        isPublished: true,
        sortOrder: 0,
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
                        ? t('admin.categories.addNew', 'Add New Category')
                        : t('admin.categories.edit', 'Edit Category')}
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
                                    {t('admin.categories.name', 'Name')} *
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`admin-form-input ${
                                        errors.name && touched.name ? 'error' : ''
                                    }`}
                                    placeholder={t(
                                        'admin.categories.namePlaceholder',
                                        'Enter category name',
                                    )}
                                />
                                <ErrorMessage
                                    name="name"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Slug Field */}
                            <div className="admin-form-group">
                                <label htmlFor="slug" className="admin-form-label">
                                    {t('admin.categories.slug', 'Slug')}
                                </label>
                                <SlugInput
                                    nameValue={values.name}
                                    slugValue={values.slug}
                                    onSlugChange={(slug) => setFieldValue('slug', slug)}
                                    checkSlugExists={checkCategorySlugExists}
                                    disabled={isSubmitting}
                                    required={false}
                                    showValidation={true}
                                    autoGenerate={true}
                                />
                                <ErrorMessage
                                    name="slug"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Parent Category Field */}
                            <div className="admin-form-group">
                                <label htmlFor="parentCategory" className="admin-form-label">
                                    {t('admin.categories.parentCategory', 'Parent Category')} *
                                </label>
                                <Field
                                    as="select"
                                    id="parentCategory"
                                    name="parentCategory"
                                    className={`admin-form-input ${
                                        errors.parentCategory && touched.parentCategory
                                            ? 'error'
                                            : ''
                                    }`}
                                >
                                    <option value="">
                                        {t(
                                            'admin.categories.selectParentCategory',
                                            'Select parent category',
                                        )}
                                    </option>
                                    {parentCategories.map((parent) => (
                                        <option key={parent._id} value={parent._id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage
                                    name="parentCategory"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Icon URL Field */}
                            <div className="admin-form-group">
                                <label htmlFor="iconUrl" className="admin-form-label">
                                    {t('admin.categories.iconUrl', 'Icon URL')} *
                                </label>
                                <Field
                                    type="url"
                                    id="iconUrl"
                                    name="iconUrl"
                                    className={`admin-form-input ${
                                        errors.iconUrl && touched.iconUrl ? 'error' : ''
                                    }`}
                                    placeholder={t(
                                        'admin.categories.iconPlaceholder',
                                        'https://example.com/icon.jpg',
                                    )}
                                />
                                <ErrorMessage
                                    name="iconUrl"
                                    component="div"
                                    className="admin-form-error"
                                />
                                {values.iconUrl && (
                                    <div className="admin-form-image-preview">
                                        <img
                                            src={values.iconUrl}
                                            alt="Preview"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description Field */}
                            <div className="admin-form-group admin-form-group-full">
                                <label htmlFor="description" className="admin-form-label">
                                    {t('admin.categories.description', 'Description')}
                                </label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    className={`admin-form-textarea ${
                                        errors.description && touched.description ? 'error' : ''
                                    }`}
                                    placeholder={t(
                                        'admin.categories.descriptionPlaceholder',
                                        'Describe this category...',
                                    )}
                                />
                                <ErrorMessage
                                    name="description"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Status and Sort Order */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    {t('admin.categories.status', 'Status')}
                                </label>
                                <div className="admin-form-checkbox">
                                    <Field
                                        type="checkbox"
                                        id="isPublished"
                                        name="isPublished"
                                        className="admin-checkbox"
                                    />
                                    <label htmlFor="isPublished" className="admin-checkbox-label">
                                        {t('admin.categories.published', 'Published')}
                                    </label>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="sortOrder" className="admin-form-label">
                                    {t('admin.categories.sortOrder', 'Sort Order')}
                                </label>
                                <Field
                                    type="number"
                                    id="sortOrder"
                                    name="sortOrder"
                                    min="0"
                                    className={`admin-form-input ${
                                        errors.sortOrder && touched.sortOrder ? 'error' : ''
                                    }`}
                                    placeholder="0"
                                />
                                <ErrorMessage
                                    name="sortOrder"
                                    component="div"
                                    className="admin-form-error"
                                />
                                <div className="admin-form-help">
                                    {t(
                                        'admin.categories.sortOrderHelp',
                                        'Lower numbers appear first',
                                    )}
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
                                disabled={
                                    isSubmitting || categoryCreateLoading || categoryUpdateLoading
                                }
                            >
                                {isSubmitting
                                    ? t('common.saving', 'Saving...')
                                    : mode === 'addnew'
                                    ? t('admin.categories.create', 'Create Category')
                                    : t('admin.categories.update', 'Update Category')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CategoryForm;
