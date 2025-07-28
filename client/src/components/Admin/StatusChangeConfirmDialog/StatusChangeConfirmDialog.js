import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const StatusChangeConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    currentStatus,
    newStatus,
    orderNumber,
    message,
    isLoading = false
}) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            processing: '⚙️',
            delivering: '🚚',
            delivered: '✅',
            cancelled: '❌',
            refunded: '💰'
        };
        return icons[status] || '📋';
    };

    const getStatusLabel = (status) => {
        return t(`admin.orders.status.${status}`, status);
    };

    const isCriticalChange = ['cancelled', 'refunded'].includes(newStatus);

    return (
        <div className="status-change-dialog-overlay" onClick={onClose}>
            <div className="status-change-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3 className="dialog-title">
                        {isCriticalChange ? '⚠️' : '📋'} {t('admin.orders.confirmStatusChange', 'Confirm Status Change')}
                    </h3>
                    <button 
                        className="dialog-close-btn"
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label={t('common.close', 'Close')}
                    >
                        ✕
                    </button>
                </div>

                <div className="dialog-content">
                    <div className="order-info">
                        <p className="order-number">
                            {t('admin.orders.orderNumber', 'Order #')}{orderNumber}
                        </p>
                    </div>

                    <div className="status-change-preview">
                        <div className="status-item current">
                            <span className="status-icon">{getStatusIcon(currentStatus)}</span>
                            <span className="status-label">{getStatusLabel(currentStatus)}</span>
                            <span className="status-type">{t('admin.orders.currentStatus', 'Current')}</span>
                        </div>
                        
                        <div className="status-arrow">→</div>
                        
                        <div className="status-item new">
                            <span className="status-icon">{getStatusIcon(newStatus)}</span>
                            <span className="status-label">{getStatusLabel(newStatus)}</span>
                            <span className="status-type">{t('admin.orders.newStatus', 'New')}</span>
                        </div>
                    </div>

                    <div className="confirmation-message">
                        <p>{message}</p>
                        {isCriticalChange && (
                            <div className="warning-notice">
                                <span className="warning-icon">⚠️</span>
                                <span className="warning-text">
                                    {t('admin.orders.criticalChangeWarning', 'This action cannot be undone.')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dialog-actions">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        className={`btn-primary ${isCriticalChange ? 'critical' : ''}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner">⏳</span>
                                {t('common.updating', 'Updating...')}
                            </>
                        ) : (
                            <>
                                {isCriticalChange ? '⚠️' : '✓'} {t('common.confirm', 'Confirm')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeConfirmDialog;
