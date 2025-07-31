import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import {
    applyCouponToCheckout,
    removeCouponFromCheckout,
    clearCheckoutCouponErrors,
} from '../../store/actions/checkoutActions';
import './CouponInput.css';

const CouponInput = ({ orderValue, userId, onCouponApplied, onCouponRemoved }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Local state
    const [couponCode, setCouponCode] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Redux state
    const { coupon } = useSelector((state) => state.checkout);
    const { applied, discountAmount, loading, error } = coupon;

    // Handle coupon application
    const handleApplyCoupon = async (e) => {
        e.preventDefault();

        if (!couponCode.trim()) {
            toast.error(t('checkout.coupon.enterCode', 'Please enter a coupon code'));
            return;
        }

        // Basic validation
        const code = couponCode.trim().toUpperCase();
        if (code.length < 3 || code.length > 20) {
            toast.error(
                t(
                    'checkout.coupon.invalidLength',
                    'Coupon code must be between 3 and 20 characters',
                ),
            );
            return;
        }

        if (!/^[A-Z0-9]+$/.test(code)) {
            toast.error(
                t(
                    'checkout.coupon.invalidFormat',
                    'Coupon code can only contain letters and numbers',
                ),
            );
            return;
        }

        try {
            await dispatch(applyCouponToCheckout(code, orderValue, userId));
            toast.success(t('checkout.coupon.applied', 'Coupon applied successfully!'));
            setCouponCode('');
            setIsExpanded(false);

            // Notify parent component
            if (onCouponApplied) {
                onCouponApplied(applied, discountAmount);
            }
        } catch (error) {
            // Handle specific error types
            const errorMessage = error.response?.data?.error?.message || error.message;

            if (errorMessage.includes('not found')) {
                toast.error(t('checkout.coupon.notFound', 'Coupon code not found'));
            } else if (errorMessage.includes('expired')) {
                toast.error(t('checkout.coupon.expired', 'This coupon has expired'));
            } else if (errorMessage.includes('minimum order')) {
                toast.error(
                    t(
                        'checkout.coupon.minimumOrder',
                        'Order does not meet minimum value requirement',
                    ),
                );
            } else if (errorMessage.includes('usage limit')) {
                toast.error(
                    t(
                        'checkout.coupon.usageLimit',
                        'You have reached the usage limit for this coupon',
                    ),
                );
            } else if (errorMessage.includes('not active')) {
                toast.error(t('checkout.coupon.notActive', 'This coupon is not currently active'));
            } else {
                toast.error(
                    errorMessage ||
                        t(
                            'checkout.coupon.applyError',
                            'Failed to apply coupon. Please try again.',
                        ),
                );
            }

            console.error('Coupon application failed:', error);
        }
    };

    // Handle coupon removal
    const handleRemoveCoupon = () => {
        dispatch(removeCouponFromCheckout());
        toast.info(t('checkout.coupon.removed', 'Coupon removed'));

        // Notify parent component
        if (onCouponRemoved) {
            onCouponRemoved();
        }
    };

    // Real-time validation
    const validateCouponCode = (code) => {
        if (!code.trim()) {
            setValidationError('');
            return true;
        }

        if (code.length < 3) {
            setValidationError(t('checkout.coupon.tooShort', 'Too short'));
            return false;
        }

        if (code.length > 20) {
            setValidationError(t('checkout.coupon.tooLong', 'Too long'));
            return false;
        }

        if (!/^[A-Z0-9]+$/.test(code)) {
            setValidationError(t('checkout.coupon.invalidChars', 'Invalid characters'));
            return false;
        }

        setValidationError('');
        return true;
    };

    // Handle coupon code input changes
    const handleCouponCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCouponCode(value);
        validateCouponCode(value);
    };

    // Clear errors when component unmounts or coupon code changes
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearCheckoutCouponErrors());
        }
    }, [error, dispatch]);

    // Format discount display
    const formatDiscount = () => {
        if (!applied) return '';

        if (applied.discountType === 'percentage') {
            return `${applied.discountValue}%`;
        } else {
            return `${discountAmount.toLocaleString()}đ`;
        }
    };

    return (
        <div className="coupon-input-container">
            {applied ? (
                // Applied coupon display
                <div className="coupon-applied">
                    <div className="coupon-applied-info">
                        <div className="coupon-applied-header">
                            <i className="fas fa-tag coupon-icon"></i>
                            <span className="coupon-code">{applied.code}</span>
                            <span className="coupon-discount">-{formatDiscount()}</span>
                        </div>
                        <div className="coupon-applied-description">
                            {applied.description ||
                                t('checkout.coupon.discountApplied', 'Discount applied')}
                        </div>
                        <div className="coupon-savings">
                            {t('checkout.coupon.youSave', 'You save')}:{' '}
                            {discountAmount.toLocaleString()}đ
                        </div>
                    </div>
                    <button
                        type="button"
                        className="coupon-remove-btn"
                        onClick={handleRemoveCoupon}
                        aria-label={t('checkout.coupon.remove', 'Remove coupon')}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ) : (
                // Coupon input form
                <div className="coupon-input-section">
                    {!isExpanded ? (
                        <button
                            type="button"
                            className="coupon-toggle-btn"
                            onClick={() => setIsExpanded(true)}
                        >
                            <i className="fas fa-tag"></i>
                            {t('checkout.coupon.haveCoupon', 'Have a coupon code?')}
                            <i className="fas fa-chevron-down"></i>
                        </button>
                    ) : (
                        <form onSubmit={handleApplyCoupon} className="coupon-form">
                            <div className="coupon-form-header">
                                <h4>{t('checkout.coupon.enterCode', 'Enter coupon code')}</h4>
                                <button
                                    type="button"
                                    className="coupon-collapse-btn"
                                    onClick={() => {
                                        setIsExpanded(false);
                                        setCouponCode('');
                                    }}
                                    aria-label={t('common.close', 'Close')}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="coupon-input-group">
                                <div className="coupon-input-wrapper">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={handleCouponCodeChange}
                                        placeholder={t(
                                            'checkout.coupon.placeholder',
                                            'Enter coupon code',
                                        )}
                                        className={`coupon-input ${validationError ? 'error' : ''}`}
                                        disabled={loading}
                                        maxLength={20}
                                    />
                                    {validationError && (
                                        <div className="coupon-validation-error">
                                            <i className="fas fa-exclamation-triangle"></i>
                                            {validationError}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="coupon-apply-btn"
                                    disabled={loading || !couponCode.trim() || !!validationError}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            {t('common.loading', 'Loading...')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check"></i>
                                            {t('checkout.coupon.apply', 'Apply')}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="coupon-help-text">
                                {t(
                                    'checkout.coupon.helpText',
                                    'Enter your coupon code to get a discount on your order',
                                )}
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

CouponInput.propTypes = {
    orderValue: PropTypes.number.isRequired,
    userId: PropTypes.string,
    onCouponApplied: PropTypes.func,
    onCouponRemoved: PropTypes.func,
};

export default CouponInput;
