import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import OrderStatusBadge from '../OrderStatusBadge/OrderStatusBadge';
import StatusChangeConfirmDialog from '../StatusChangeConfirmDialog/StatusChangeConfirmDialog';
import {
    validateStatusTransition,
    getAllowedNextStatuses,
    getStatusTransitionMessages,
} from '../../../utils/orderStatusTransitions';
import './styles.css';

const OrderStatusControl = ({
    currentStatus,
    orderId,
    orderNumber,
    isPaid,
    paymentMethod,
    onStatusUpdate,
    disabled = false,
    size = 'medium',
}) => {
    const { t } = useI18n();
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [validationMessage, setValidationMessage] = useState('');

    // Get allowed next statuses
    const allowedStatuses = getAllowedNextStatuses(currentStatus);

    const statusOptions = [
        { value: 'pending', label: t('admin.orders.status.pending', 'Pending') },
        { value: 'processing', label: t('admin.orders.status.processing', 'Processing') },
        { value: 'delivering', label: t('admin.orders.status.delivering', 'Delivering') },
        { value: 'delivered', label: t('admin.orders.status.delivered', 'Delivered') },
        { value: 'cancelled', label: t('admin.orders.status.cancelled', 'Cancelled') },
        { value: 'refunded', label: t('admin.orders.status.refunded', 'Refunded') },
    ].filter((option) => allowedStatuses.includes(option.value));

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;

        if (newStatus === currentStatus || !newStatus) return;

        // Validate the status transition
        const validation = validateStatusTransition(
            currentStatus,
            newStatus,
            isPaid,
            paymentMethod,
        );

        if (!validation.isValid) {
            setValidationMessage(validation.message);
            // Reset select to current status
            e.target.value = currentStatus;
            return;
        }

        setPendingStatus(newStatus);

        if (validation.requiresConfirmation) {
            setValidationMessage(getStatusTransitionMessages(currentStatus, newStatus));
            setShowConfirmDialog(true);
        } else {
            await executeStatusUpdate(newStatus);
        }
    };

    const executeStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            await onStatusUpdate(orderId, newStatus);
            setShowConfirmDialog(false);
            setPendingStatus(null);
            setValidationMessage('');
        } catch (error) {
            console.error('Failed to update order status:', error);
            // Reset select to current status on error
            const selectElement = document.querySelector(`select[data-order-id="${orderId}"]`);
            if (selectElement) {
                selectElement.value = currentStatus;
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmStatusChange = () => {
        if (pendingStatus) {
            executeStatusUpdate(pendingStatus);
        }
    };

    const handleCancelStatusChange = () => {
        setShowConfirmDialog(false);
        setPendingStatus(null);
        setValidationMessage('');

        // Reset select to current status
        const selectElement = document.querySelector(`select[data-order-id="${orderId}"]`);
        if (selectElement) {
            selectElement.value = currentStatus;
        }
    };

    return (
        <div className={`order-status-control ${size}`}>
            <div className="status-display">
                <OrderStatusBadge status={currentStatus} size={size} />
                {paymentMethod === 'COD' && (
                    <span
                        className="cod-indicator"
                        title="COD orders can be delivered without payment"
                    >
                        💰 COD
                    </span>
                )}
            </div>

            <div className="status-controls">
                <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    disabled={disabled || isUpdating || allowedStatuses.length === 0}
                    className="status-select"
                    data-order-id={orderId}
                    title={
                        allowedStatuses.length === 0
                            ? t(
                                  'admin.orders.noTransitionsAvailable',
                                  'No status transitions available',
                              )
                            : t('admin.orders.updateStatus', 'Update Status')
                    }
                >
                    <option value={currentStatus}>
                        {t(`admin.orders.status.${currentStatus}`, currentStatus)}
                    </option>
                    {statusOptions.map((option) => (
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
            </div>

            {validationMessage && !showConfirmDialog && (
                <div className="validation-message error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{validationMessage}</span>
                </div>
            )}

            <StatusChangeConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelStatusChange}
                onConfirm={handleConfirmStatusChange}
                currentStatus={currentStatus}
                newStatus={pendingStatus}
                orderNumber={orderNumber}
                message={validationMessage}
                isLoading={isUpdating}
            />
        </div>
    );
};

export default OrderStatusControl;
