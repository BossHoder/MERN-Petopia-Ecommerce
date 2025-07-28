import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const PaymentStatusControl = ({
    currentStatus,
    orderId,
    onStatusUpdate,
    disabled = false,
    size = 'medium',
    orderStatus = null,
}) => {
    const { t } = useI18n();
    const [isUpdating, setIsUpdating] = useState(false);

    // Check if payment status updates should be disabled
    const isPaymentUpdateDisabled =
        disabled || orderStatus === 'cancelled' || orderStatus === 'refunded' || isUpdating;

    const paymentStatusOptions = [
        { value: true, label: t('admin.orders.paymentStatusControl.paid', 'Paid') },
        { value: false, label: t('admin.orders.paymentStatusControl.unpaid', 'Unpaid') },
    ];

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value === 'true';

        if (newStatus === currentStatus || isPaymentUpdateDisabled) return;

        setIsUpdating(true);
        try {
            await onStatusUpdate(orderId, newStatus);
        } catch (error) {
            console.error('Failed to update payment status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getCurrentStatusConfig = () => {
        return currentStatus
            ? {
                  className: 'payment-status-paid',
                  icon: '✅',
                  label: t('admin.orders.paymentStatusControl.paid', 'Paid'),
                  bgColor: '#D4EDDA',
                  textColor: '#155724',
              }
            : {
                  className: 'payment-status-unpaid',
                  icon: '⏳',
                  label: t('admin.orders.paymentStatusControl.unpaid', 'Unpaid'),
                  bgColor: '#FFF3CD',
                  textColor: '#856404',
              };
    };

    const statusConfig = getCurrentStatusConfig();

    return (
        <div className={`payment-status-control ${size}`}>
            <div className="payment-status-display">
                <span
                    className={`payment-status-badge ${statusConfig.className}`}
                    style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.textColor,
                    }}
                >
                    <span className="status-icon" aria-hidden="true">
                        {statusConfig.icon}
                    </span>
                    <span className="status-text">{statusConfig.label}</span>
                </span>
            </div>

            <div className="payment-status-controls">
                <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    disabled={isPaymentUpdateDisabled}
                    className="payment-status-select"
                    title={
                        isPaymentUpdateDisabled &&
                        (orderStatus === 'cancelled' || orderStatus === 'refunded')
                            ? t(
                                  'admin.orders.paymentStatusControl.disabledForStatus',
                                  'Payment status cannot be changed for cancelled or refunded orders',
                              )
                            : t(
                                  'admin.orders.paymentStatusControl.updatePaymentStatus',
                                  'Update Payment Status',
                              )
                    }
                >
                    {paymentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {isUpdating && (
                    <div className="updating-indicator">
                        <span className="spinner" aria-hidden="true">
                            ⏳
                        </span>
                        <span className="sr-only">Updating...</span>
                    </div>
                )}

                {isPaymentUpdateDisabled &&
                    (orderStatus === 'cancelled' || orderStatus === 'refunded') && (
                        <div className="disabled-indicator">
                            <span className="disabled-icon" aria-hidden="true">
                                🚫
                            </span>
                            <span className="disabled-text">
                                {t(
                                    'admin.orders.paymentStatusControl.disabledForStatus',
                                    'Payment status cannot be changed for cancelled or refunded orders',
                                )}
                            </span>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default PaymentStatusControl;
