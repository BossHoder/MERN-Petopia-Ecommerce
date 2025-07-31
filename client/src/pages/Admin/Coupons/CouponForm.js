import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import { createCoupon, updateCoupon, clearAdminErrors } from '../../../store/actions/adminActions';
import API from '../../../services/api';

const CouponForm = ({ mode, couponId, onClose, onSuccess }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);

    const { couponCreateLoading, couponUpdateLoading, error } = useSelector((state) => state.admin);

    // Validation schema
    const validationSchema = Yup.object({
        code: Yup.string()
            .min(3, t('validation.coupon.codeMin', 'Code must be at least 3 characters'))
            .max(20, t('validation.coupon.codeMax', 'Code cannot exceed 20 characters'))
            .matches(
                /^[A-Z0-9]+$/,
                t(
                    'validation.coupon.codePattern',
                    'Code can only contain uppercase letters and numbers',
                ),
            )
            .required(t('validation.coupon.codeRequired', 'Code is required')),

        description: Yup.string()
            .min(
                10,
                t('validation.coupon.descriptionMin', 'Description must be at least 10 characters'),
            )
            .max(
                200,
                t('validation.coupon.descriptionMax', 'Description cannot exceed 200 characters'),
            )
            .required(t('validation.coupon.descriptionRequired', 'Description is required')),

        discountType: Yup.string()
            .oneOf(
                ['percentage', 'fixed'],
                t('validation.coupon.discountTypeInvalid', 'Invalid discount type'),
            )
            .required(t('validation.coupon.discountTypeRequired', 'Discount type is required')),

        discountValue: Yup.number()
            .min(
                0,
                t('validation.coupon.discountValueMin', 'Discount value must be greater than 0'),
            )
            .test(
                'percentage-max',
                t('validation.coupon.percentageMax', 'Percentage cannot exceed 100'),
                function (value) {
                    if (this.parent.discountType === 'percentage') {
                        return value <= 100;
                    }
                    return true;
                },
            )
            .required(t('validation.coupon.discountValueRequired', 'Discount value is required')),

        usageLimit: Yup.number()
            .nullable()
            .min(1, t('validation.coupon.usageLimitMin', 'Usage limit must be at least 1')),

        perUserLimit: Yup.number()
            .min(1, t('validation.coupon.perUserLimitMin', 'Per user limit must be at least 1'))
            .required(t('validation.coupon.perUserLimitRequired', 'Per user limit is required')),

        minOrderValue: Yup.number()
            .min(
                0,
                t('validation.coupon.minOrderValueMin', 'Minimum order value cannot be negative'),
            )
            .required(
                t('validation.coupon.minOrderValueRequired', 'Minimum order value is required'),
            ),

        maxDiscountAmount: Yup.number()
            .nullable()
            .min(
                0,
                t(
                    'validation.coupon.maxDiscountAmountMin',
                    'Maximum discount amount cannot be negative',
                ),
            ),

        validFrom: Yup.date().required(
            t('validation.coupon.validFromRequired', 'Valid from date is required'),
        ),

        validUntil: Yup.date()
            .min(
                Yup.ref('validFrom'),
                t('validation.coupon.validUntilAfter', 'Valid until must be after valid from'),
            )
            .required(t('validation.coupon.validUntilRequired', 'Valid until date is required')),

        isActive: Yup.boolean(),
    });

    // Load existing data for edit mode
    useEffect(() => {
        if (mode === 'edit' && couponId) {
            setLoading(true);
            API.get(`/api/admin/coupons/${couponId}`)
                .then((response) => {
                    const coupon = response.data.data;
                    setInitialData({
                        code: coupon.code || '',
                        description: coupon.description || '',
                        discountType: coupon.discountType || 'percentage',
                        discountValue: coupon.discountValue || 0,
                        usageLimit: coupon.usageLimit || '',
                        perUserLimit: coupon.perUserLimit || 1,
                        minOrderValue: coupon.minOrderValue || 0,
                        maxDiscountAmount: coupon.maxDiscountAmount || '',
                        validFrom: coupon.validFrom
                            ? new Date(coupon.validFrom).toISOString().split('T')[0]
                            : '',
                        validUntil: coupon.validUntil
                            ? new Date(coupon.validUntil).toISOString().split('T')[0]
                            : '',
                        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
                    });
                })
                .catch((error) => {
                    console.error('Error loading coupon:', error);
                    toast.error(t('admin.coupons.loadError', 'Failed to load coupon data'));
                    onClose();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // Default values for new coupon
            setInitialData({
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                usageLimit: '',
                perUserLimit: 1,
                minOrderValue: 0,
                maxDiscountAmount: '',
                validFrom: new Date().toISOString().split('T')[0],
                validUntil: '',
                isActive: true,
            });
        }
    }, [mode, couponId, onClose, t]);

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // Prepare data
            const couponData = {
                ...values,
                code: values.code.toUpperCase(),
                usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
                maxDiscountAmount: values.maxDiscountAmount
                    ? parseFloat(values.maxDiscountAmount)
                    : null,
                validFrom: new Date(values.validFrom),
                validUntil: new Date(values.validUntil),
            };

            if (mode === 'edit') {
                dispatch(updateCoupon(couponId, couponData));
                toast.success(t('admin.coupons.updateSuccess', 'Coupon updated successfully'));
            } else {
                dispatch(createCoupon(couponData));
                toast.success(t('admin.coupons.createSuccess', 'Coupon created successfully'));
            }

            onSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(
                mode === 'edit'
                    ? t('admin.coupons.updateError', 'Failed to update coupon')
                    : t('admin.coupons.createError', 'Failed to create coupon'),
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminErrors());
        }
    }, [error, dispatch]);

    if (loading || !initialData) {
        return (
            <div className="admin-form-container">
                <div className="admin-form-loading">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            <div className="admin-form-header">
                <h2>
                    {mode === 'edit'
                        ? t('admin.coupons.editCoupon', 'Edit Coupon')
                        : t('admin.coupons.addNewCoupon', 'Add New Coupon')}
                </h2>
                <button className="admin-form-close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <Formik
                initialValues={initialData}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, isSubmitting }) => (
                    <Form className="admin-form">
                        <div className="admin-form-grid">
                            {/* Basic Information */}
                            <div className="admin-form-section">
                                <h3>{t('admin.coupons.basicInfo', 'Basic Information')}</h3>

                                <div className="admin-form-group">
                                    <label htmlFor="code">
                                        {t('admin.coupons.code', 'Code')} *
                                    </label>
                                    <Field
                                        type="text"
                                        id="code"
                                        name="code"
                                        className="admin-form-input"
                                        placeholder={t(
                                            'admin.coupons.codePlaceholder',
                                            'e.g., SAVE20',
                                        )}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <ErrorMessage
                                        name="code"
                                        component="div"
                                        className="admin-form-error"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="description">
                                        {t('admin.coupons.description', 'Description')} *
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        className="admin-form-textarea"
                                        placeholder={t(
                                            'admin.coupons.descriptionPlaceholder',
                                            'Describe this coupon...',
                                        )}
                                        rows="3"
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="admin-form-error"
                                    />
                                </div>
                            </div>

                            {/* Discount Configuration */}
                            <div className="admin-form-section">
                                <h3>
                                    {t('admin.coupons.discountConfig', 'Discount Configuration')}
                                </h3>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label htmlFor="discountType">
                                            {t('admin.coupons.discountType', 'Discount Type')} *
                                        </label>
                                        <Field
                                            as="select"
                                            id="discountType"
                                            name="discountType"
                                            className="admin-form-select"
                                        >
                                            <option value="percentage">
                                                {t('admin.coupons.percentage', 'Percentage')}
                                            </option>
                                            <option value="fixed">
                                                {t('admin.coupons.fixed', 'Fixed Amount')}
                                            </option>
                                        </Field>
                                        <ErrorMessage
                                            name="discountType"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="discountValue">
                                            {t('admin.coupons.discountValue', 'Discount Value')} *
                                        </label>
                                        <Field
                                            type="number"
                                            id="discountValue"
                                            name="discountValue"
                                            className="admin-form-input"
                                            min="0"
                                            max={
                                                values.discountType === 'percentage'
                                                    ? '100'
                                                    : undefined
                                            }
                                            step={
                                                values.discountType === 'percentage' ? '1' : '0.01'
                                            }
                                        />
                                        <ErrorMessage
                                            name="discountValue"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>
                                </div>

                                {values.discountType === 'percentage' && (
                                    <div className="admin-form-group">
                                        <label htmlFor="maxDiscountAmount">
                                            {t(
                                                'admin.coupons.maxDiscountAmount',
                                                'Maximum Discount Amount',
                                            )}
                                        </label>
                                        <Field
                                            type="number"
                                            id="maxDiscountAmount"
                                            name="maxDiscountAmount"
                                            className="admin-form-input"
                                            min="0"
                                            step="0.01"
                                            placeholder={t(
                                                'admin.coupons.maxDiscountPlaceholder',
                                                'Leave empty for no limit',
                                            )}
                                        />
                                        <ErrorMessage
                                            name="maxDiscountAmount"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>
                                )}

                                <div className="admin-form-group">
                                    <label htmlFor="minOrderValue">
                                        {t('admin.coupons.minOrderValue', 'Minimum Order Value')} *
                                    </label>
                                    <Field
                                        type="number"
                                        id="minOrderValue"
                                        name="minOrderValue"
                                        className="admin-form-input"
                                        min="0"
                                        step="0.01"
                                    />
                                    <ErrorMessage
                                        name="minOrderValue"
                                        component="div"
                                        className="admin-form-error"
                                    />
                                </div>
                            </div>

                            {/* Usage Limits */}
                            <div className="admin-form-section">
                                <h3>{t('admin.coupons.usageLimits', 'Usage Limits')}</h3>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label htmlFor="usageLimit">
                                            {t('admin.coupons.usageLimit', 'Total Usage Limit')}
                                        </label>
                                        <Field
                                            type="number"
                                            id="usageLimit"
                                            name="usageLimit"
                                            className="admin-form-input"
                                            min="1"
                                            placeholder={t(
                                                'admin.coupons.usageLimitPlaceholder',
                                                'Leave empty for unlimited',
                                            )}
                                        />
                                        <ErrorMessage
                                            name="usageLimit"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="perUserLimit">
                                            {t('admin.coupons.perUserLimit', 'Per User Limit')} *
                                        </label>
                                        <Field
                                            type="number"
                                            id="perUserLimit"
                                            name="perUserLimit"
                                            className="admin-form-input"
                                            min="1"
                                        />
                                        <ErrorMessage
                                            name="perUserLimit"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Validity Period */}
                            <div className="admin-form-section">
                                <h3>{t('admin.coupons.validityPeriod', 'Validity Period')}</h3>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label htmlFor="validFrom">
                                            {t('admin.coupons.validFrom', 'Valid From')} *
                                        </label>
                                        <Field
                                            type="date"
                                            id="validFrom"
                                            name="validFrom"
                                            className="admin-form-input"
                                        />
                                        <ErrorMessage
                                            name="validFrom"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="validUntil">
                                            {t('admin.coupons.validUntil', 'Valid Until')} *
                                        </label>
                                        <Field
                                            type="date"
                                            id="validUntil"
                                            name="validUntil"
                                            className="admin-form-input"
                                        />
                                        <ErrorMessage
                                            name="validUntil"
                                            component="div"
                                            className="admin-form-error"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="admin-form-section">
                                <h3>{t('admin.coupons.status', 'Status')}</h3>

                                <div className="admin-form-group">
                                    <label className="admin-form-checkbox-label">
                                        <Field
                                            type="checkbox"
                                            name="isActive"
                                            className="admin-form-checkbox"
                                        />
                                        {t('admin.coupons.isActive', 'Active')}
                                    </label>
                                    <small className="admin-form-help">
                                        {t(
                                            'admin.coupons.isActiveHelp',
                                            'Inactive coupons cannot be used by customers',
                                        )}
                                    </small>
                                </div>
                            </div>
                        </div>

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
                                    isSubmitting || couponCreateLoading || couponUpdateLoading
                                }
                            >
                                {isSubmitting
                                    ? t('common.saving', 'Saving...')
                                    : mode === 'edit'
                                    ? t('common.update', 'Update')
                                    : t('common.create', 'Create')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CouponForm;
