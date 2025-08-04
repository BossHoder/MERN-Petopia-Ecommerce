import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const CouponCard = ({ coupon }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    // Format discount display
    const formatDiscount = () => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`;
        } else {
            return `${coupon.discountValue.toLocaleString('vi-VN')}đ`;
        }
    };

    // Format minimum order value
    const formatMinOrder = () => {
        if (coupon.minOrderValue > 0) {
            return coupon.minOrderValue.toLocaleString();
        }
        return null;
    };

    // Format expiration date
    const formatExpirationDate = () => {
        const date = new Date(coupon.validUntil);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calculate days until expiration
    const getDaysUntilExpiration = () => {
        const now = new Date();
        const expiration = new Date(coupon.validUntil);
        const diffTime = expiration - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Copy coupon code to clipboard
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(coupon.code);
            setCopied(true);
            toast.success(t('coupons.codeCopied', 'Coupon code copied to clipboard!'));

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = coupon.code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            setCopied(true);
            toast.success(t('coupons.codeCopied', 'Coupon code copied to clipboard!'));

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    };

    const daysUntilExpiration = getDaysUntilExpiration();
    const isExpiringSoon = daysUntilExpiration <= 7;
    const minOrder = formatMinOrder();

    return (
        <article
            className={`coupon-card ${isExpiringSoon ? 'expiring-soon' : ''}`}
            role="article"
            aria-labelledby={`coupon-title-${coupon.id}`}
            aria-describedby={`coupon-details-${coupon.id}`}
        >
            {/* Discount Badge */}
            <div className="coupon-discount" role="banner">
                <div className="discount-value" aria-label={`${formatDiscount()} discount`}>
                    {formatDiscount()}
                </div>
                <div className="discount-label">
                    {coupon.discountType === 'percentage'
                        ? t('coupons.off', 'OFF')
                        : t('coupons.discount', 'DISCOUNT')}
                </div>
            </div>

            {/* Coupon Content */}
            <div className="coupon-content">
                <div className="coupon-header">
                    <h3 id={`coupon-title-${coupon.id}`} className="coupon-title">
                        {coupon.description}
                    </h3>
                    {isExpiringSoon && (
                        <span
                            className="expiring-badge"
                            role="status"
                            aria-label={t('coupons.expiringSoon', 'Expiring Soon')}
                        >
                            {t('coupons.expiringSoon', 'Expiring Soon')}
                        </span>
                    )}
                </div>

                {/* Coupon Details */}
                <div id={`coupon-details-${coupon.id}`} className="coupon-details">
                    {minOrder && (
                        <div className="coupon-detail">
                            <i className="fas fa-shopping-cart"></i>
                            <span>
                                {t('coupons.minOrder', 'Min order')}: {minOrder}đ
                            </span>
                        </div>
                    )}

                    {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                        <div className="coupon-detail">
                            <i className="fas fa-tag"></i>
                            <span>
                                {t('coupons.maxDiscount', 'Max discount')}:{' '}
                                {coupon.maxDiscountAmount.toLocaleString()}đ
                            </span>
                        </div>
                    )}

                    <div className="coupon-detail">
                        <i className="fas fa-calendar-alt"></i>
                        <span>
                            {t('coupons.validUntil', 'Valid until')}: {formatExpirationDate()}
                        </span>
                    </div>

                    <div className="coupon-detail">
                        <i className="fas fa-user"></i>
                        <span>
                            {t('coupons.perUserLimit', 'Limit')}: {coupon.perUserLimit}{' '}
                            {t('coupons.timesPerUser', 'time(s) per user')}
                        </span>
                    </div>
                </div>

                {/* Coupon Code */}
                <div className="coupon-code-section" role="region" aria-label="Coupon code">
                    <div className="coupon-code">
                        <span className="code-label">{t('coupons.code', 'Code')}:</span>
                        <span
                            className="code-value"
                            role="text"
                            aria-label={`Coupon code: ${coupon.code}`}
                        >
                            {coupon.code}
                        </span>
                    </div>

                    <button
                        className={`copy-button ${copied ? 'copied' : ''}`}
                        onClick={handleCopyCode}
                        aria-label={
                            copied
                                ? t('coupons.copied', 'Copied')
                                : t('coupons.copyCode', 'Copy coupon code')
                        }
                        aria-describedby={`coupon-code-${coupon.id}`}
                    >
                        {copied ? (
                            <>
                                <i className="fas fa-check"></i>
                                {t('coupons.copied', 'Copied')}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-copy"></i>
                                {t('coupons.copy', 'Copy')}
                            </>
                        )}
                    </button>
                </div>

                {/* Expiration Warning */}
                {isExpiringSoon && (
                    <div className="expiration-warning" role="alert" aria-live="polite">
                        <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                        {daysUntilExpiration === 1
                            ? t('coupons.expiresIn1Day', 'Expires in 1 day')
                            : t('coupons.expiresInDays', 'Expires in {{days}} days', {
                                  days: daysUntilExpiration,
                              })}
                    </div>
                )}
            </div>
        </article>
    );
};

CouponCard.propTypes = {
    coupon: PropTypes.shape({
        id: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        discountType: PropTypes.oneOf(['percentage', 'fixed']).isRequired,
        discountValue: PropTypes.number.isRequired,
        minOrderValue: PropTypes.number,
        maxDiscountAmount: PropTypes.number,
        validFrom: PropTypes.string.isRequired,
        validUntil: PropTypes.string.isRequired,
        perUserLimit: PropTypes.number.isRequired,
    }).isRequired,
};

export default CouponCard;
