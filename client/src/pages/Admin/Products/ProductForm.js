import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    createProduct,
    updateProduct,
    clearAdminErrors,
} from '../../../store/actions/adminActions';
import { getAllCategories } from '../../../store/actions/categoryActions';
import ImageUpload from '../../../components/Admin/ImageUpload';
import AttributesManager from '../../../components/Admin/AttributesManager';
import VariantsManager from '../../../components/Admin/VariantsManager';
import SlugSkuInput from '../../../components/SlugSkuInput/SlugSkuInput';
import API from '../../../services/api';

const ProductForm = ({ mode, productId, onClose, onSuccess }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check if product slug exists
    const checkProductSlugExists = async (slug) => {
        if (!slug || slug === initialData?.slug) return false;

        try {
            const response = await API.get(`/api/admin/products/check-slug/${slug}`);
            return response.data.data.exists;
        } catch (error) {
            console.warn('Error checking product slug:', error);
            return false;
        }
    };

    // Check if product SKU exists
    const checkProductSkuExists = async (sku) => {
        if (!sku || sku === initialData?.sku) return false;

        try {
            const response = await API.get(`/api/admin/products/check-sku/${sku}`);
            return response.data.data.exists;
        } catch (error) {
            console.warn('Error checking product SKU:', error);
            return false;
        }
    };

    const { productCreateLoading, productUpdateLoading, error } = useSelector(
        (state) => state.admin,
    );

    const { categories } = useSelector((state) => state.categories);

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, t('validation.product.nameMin', 'Name must be at least 2 characters'))
            .max(200, t('validation.product.nameMax', 'Name cannot exceed 200 characters'))
            .required(t('validation.product.nameRequired', 'Name is required')),

        description: Yup.string()
            .min(
                10,
                t(
                    'validation.product.descriptionMin',
                    'Description must be at least 10 characters',
                ),
            )
            .required(t('validation.product.descriptionRequired', 'Description is required')),

        price: Yup.number()
            .min(0, t('validation.product.priceMin', 'Price must be greater than 0'))
            .required(t('validation.product.priceRequired', 'Price is required')),

        category: Yup.string().required(
            t('validation.product.categoryRequired', 'Category is required'),
        ),

        stock: Yup.number()
            .integer(t('validation.product.stockInteger', 'Stock must be a whole number'))
            .min(0, t('validation.product.stockMin', 'Stock cannot be negative'))
            .required(t('validation.product.stockRequired', 'Stock is required')),

        slug: Yup.string()
            .matches(
                /^[a-z0-9-]+$/,
                t(
                    'validation.product.slugPattern',
                    'Slug can only contain lowercase letters, numbers, and hyphens',
                ),
            )
            .min(2, t('validation.product.slugMin', 'Slug must be at least 2 characters'))
            .max(200, t('validation.product.slugMax', 'Slug cannot exceed 200 characters')),

        images: Yup.array().min(
            1,
            t('validation.product.imagesRequired', 'At least one image is required'),
        ),

        sku: Yup.string().max(
            100,
            t('validation.product.skuMax', 'SKU cannot exceed 100 characters'),
        ),

        brand: Yup.string().max(
            100,
            t('validation.product.brandMax', 'Brand cannot exceed 100 characters'),
        ),

        attributes: Yup.object(),
        variants: Yup.array(),

        isPublished: Yup.boolean(),
        isFeatured: Yup.boolean(),
    });

    // Load categories
    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    // Load existing data for edit mode
    useEffect(() => {
        if (mode === 'edit' && productId) {
            const loadProduct = async () => {
                try {
                    setLoading(true);
                    const response = await API.get(`/api/admin/products/${productId}`);
                    setInitialData(response.data.data.product);
                } catch (error) {
                    toast.error(t('admin.products.loadError', 'Failed to load product data'));
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            loadProduct();
        }
    }, [mode, productId, onClose, t]);

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // Prepare form data for submission
            const formData = new FormData();

            // Add basic fields
            formData.append('name', values.name);
            formData.append('slug', values.slug || '');
            formData.append('sku', values.sku || '');
            formData.append('description', values.description);
            formData.append('price', values.price);
            formData.append('category', values.category);
            formData.append('stockQuantity', values.stock); // Map stock to stockQuantity for database
            formData.append('sku', values.sku || '');
            formData.append('brand', values.brand || '');
            formData.append('isPublished', values.isPublished);
            formData.append('isFeatured', values.isFeatured);

            // Add attributes as JSON string
            if (values.attributes && Object.keys(values.attributes).length > 0) {
                formData.append('attributes', JSON.stringify(values.attributes));
            }

            // Handle main product images
            const existingImages = [];

            values.images.forEach((image) => {
                if (image.isNew && image.file) {
                    // New image file to upload
                    formData.append('images', image.file);
                } else if (typeof image === 'string') {
                    // Existing image URL
                    existingImages.push(image);
                } else if (image.url) {
                    // Existing image object
                    existingImages.push(image.url);
                }
            });

            // Add existing images as JSON string
            if (existingImages.length > 0) {
                formData.append('existingImages', JSON.stringify(existingImages));
            }

            // Handle variant images
            if (values.variants && values.variants.length > 0) {
                const processedVariants = values.variants.map((variant, variantIndex) => {
                    const variantData = { ...variant };
                    const existingVariantImages = [];

                    if (variant.images && variant.images.length > 0) {
                        variant.images.forEach((image, imageIndex) => {
                            if (image.isNew && image.file) {
                                // New variant image file to upload
                                formData.append(`variantImages_${variantIndex}`, image.file);
                            } else if (typeof image === 'string') {
                                // Existing variant image URL
                                existingVariantImages.push(image);
                            } else if (image.url) {
                                // Existing variant image object
                                existingVariantImages.push(image.url);
                            }
                        });
                    }

                    // Replace images array with existing images only
                    variantData.images = existingVariantImages;
                    return variantData;
                });

                formData.append('variants', JSON.stringify(processedVariants));
            }

            if (mode === 'addnew') {
                await dispatch(createProduct(formData));
                toast.success(t('admin.products.createSuccess', 'Product created successfully'));
            } else {
                await dispatch(updateProduct(productId, formData));
                toast.success(t('admin.products.updateSuccess', 'Product updated successfully'));
            }
            onSuccess();
        } catch (error) {
            // Error is handled by Redux and displayed via toast in parent component
        } finally {
            setSubmitting(false);
        }
    };

    // Slug will be handled by SlugInput component

    // Process initial data to fix loading issues
    const processInitialData = (data) => {
        if (!data) return null;

        return {
            ...data,
            price: data.price || 0,
            stock: data.stock || data.stockQuantity || 0, // Handle both stock and stockQuantity
            category: data.category?._id || data.category || '',
            images: data.images || [],
            attributes: data.attributes || {},
            variants: data.variants || [],
            slug: data.slug || '',
            sku: data.sku || '',
            brand: data.brand || '',
            isPublished: data.isPublished !== undefined ? data.isPublished : true,
            isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
        };
    };

    const initialValues = processInitialData(initialData) || {
        name: '',
        slug: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        images: [],
        sku: '',
        brand: '',
        attributes: {},
        variants: [],
        isPublished: true,
        isFeatured: false,
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
                        ? t('admin.products.addNew', 'Add New Product')
                        : t('admin.products.edit', 'Edit Product')}
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
                                    {t('admin.products.name', 'Product Name')} *
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`admin-form-input ${
                                        errors.name && touched.name ? 'error' : ''
                                    }`}
                                    placeholder={t(
                                        'admin.products.namePlaceholder',
                                        'Enter product name',
                                    )}
                                />
                                <ErrorMessage
                                    name="name"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Slug and SKU Fields */}
                            <div className="admin-form-group">
                                <SlugSkuInput
                                    nameValue={values.name}
                                    slugValue={values.slug}
                                    skuValue={values.sku}
                                    onSlugChange={(slug) => setFieldValue('slug', slug)}
                                    onSkuChange={(sku) => setFieldValue('sku', sku)}
                                    checkSlugExists={checkProductSlugExists}
                                    checkSkuExists={checkProductSkuExists}
                                    disabled={isSubmitting}
                                    required={false}
                                    showValidation={true}
                                    autoGenerateSlug={true}
                                    autoGenerateSku={true}
                                />
                                <ErrorMessage
                                    name="slug"
                                    component="div"
                                    className="admin-form-error"
                                />
                                <ErrorMessage
                                    name="sku"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* SKU Field */}
                            <div className="admin-form-group">
                                <label htmlFor="sku" className="admin-form-label">
                                    {t('admin.products.sku', 'SKU')}
                                </label>
                                <Field
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    className={`admin-form-input ${
                                        errors.sku && touched.sku ? 'error' : ''
                                    }`}
                                    placeholder={t('admin.products.skuPlaceholder', 'Product SKU')}
                                />
                                <ErrorMessage
                                    name="sku"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Price Field */}
                            <div className="admin-form-group">
                                <label htmlFor="price" className="admin-form-label">
                                    {t('admin.products.price', 'Price')} *
                                </label>
                                <Field
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    min="0"
                                    className={`admin-form-input ${
                                        errors.price && touched.price ? 'error' : ''
                                    }`}
                                    placeholder="0.00"
                                />
                                <ErrorMessage
                                    name="price"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Stock Field */}
                            <div className="admin-form-group">
                                <label htmlFor="stock" className="admin-form-label">
                                    {t('admin.products.stock', 'Stock')} *
                                </label>
                                <Field
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    min="0"
                                    className={`admin-form-input ${
                                        errors.stock && touched.stock ? 'error' : ''
                                    }`}
                                    placeholder="0"
                                />
                                <ErrorMessage
                                    name="stock"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Category Field */}
                            <div className="admin-form-group">
                                <label htmlFor="category" className="admin-form-label">
                                    {t('admin.products.category', 'Category')} *
                                </label>
                                <Field
                                    as="select"
                                    id="category"
                                    name="category"
                                    className={`admin-form-input ${
                                        errors.category && touched.category ? 'error' : ''
                                    }`}
                                >
                                    <option value="">
                                        {t('admin.products.selectCategory', 'Select category')}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage
                                    name="category"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Brand Field */}
                            <div className="admin-form-group">
                                <label htmlFor="brand" className="admin-form-label">
                                    {t('admin.products.brand', 'Brand')}
                                </label>
                                <Field
                                    type="text"
                                    id="brand"
                                    name="brand"
                                    className={`admin-form-input ${
                                        errors.brand && touched.brand ? 'error' : ''
                                    }`}
                                    placeholder={t(
                                        'admin.products.brandPlaceholder',
                                        'Product brand',
                                    )}
                                />
                                <ErrorMessage
                                    name="brand"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>

                            {/* Description Field */}
                            <div className="admin-form-group admin-form-group-full">
                                <label htmlFor="description" className="admin-form-label">
                                    {t('admin.products.description', 'Description')} *
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
                                        'admin.products.descriptionPlaceholder',
                                        'Describe this product...',
                                    )}
                                />
                                <ErrorMessage
                                    name="description"
                                    component="div"
                                    className="admin-form-error"
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="admin-form-section">
                            <ImageUpload
                                images={values.images}
                                onImagesChange={(images) => setFieldValue('images', images)}
                                maxImages={5}
                                label={t('admin.products.images', 'Product Images')}
                                required={true}
                                error={errors.images && touched.images ? errors.images : null}
                            />
                        </div>

                        {/* Attributes Section */}
                        <div className="admin-form-section">
                            <AttributesManager
                                attributes={values.attributes}
                                onAttributesChange={(attributes) =>
                                    setFieldValue('attributes', attributes)
                                }
                                error={
                                    errors.attributes && touched.attributes
                                        ? errors.attributes
                                        : null
                                }
                            />
                        </div>

                        {/* Variants Section */}
                        <div className="admin-form-section">
                            <VariantsManager
                                variants={values.variants}
                                onVariantsChange={(variants) => setFieldValue('variants', variants)}
                                basePrice={values.price}
                                error={errors.variants && touched.variants ? errors.variants : null}
                            />
                        </div>

                        {/* Status and Settings */}
                        <div className="admin-form-grid">
                            {/* Status Fields */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    {t('admin.products.status', 'Status')}
                                </label>
                                <div className="admin-form-checkbox">
                                    <Field
                                        type="checkbox"
                                        id="isPublished"
                                        name="isPublished"
                                        className="admin-checkbox"
                                    />
                                    <label htmlFor="isPublished" className="admin-checkbox-label">
                                        {t('admin.products.published', 'Published')}
                                    </label>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    {t('admin.products.featured', 'Featured')}
                                </label>
                                <div className="admin-form-checkbox">
                                    <Field
                                        type="checkbox"
                                        id="isFeatured"
                                        name="isFeatured"
                                        className="admin-checkbox"
                                    />
                                    <label htmlFor="isFeatured" className="admin-checkbox-label">
                                        {t('admin.products.featuredProduct', 'Featured Product')}
                                    </label>
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
                                    isSubmitting || productCreateLoading || productUpdateLoading
                                }
                            >
                                {isSubmitting
                                    ? t('common.saving', 'Saving...')
                                    : mode === 'addnew'
                                    ? t('admin.products.create', 'Create Product')
                                    : t('admin.products.update', 'Update Product')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProductForm;
