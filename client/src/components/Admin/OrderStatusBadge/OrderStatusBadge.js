import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const OrderStatusBadge = ({ status, size = 'medium', showIcon = true }) => {
    const { t } = useI18n();

    // Status configuration with colors, icons, and labels
    const statusConfig = {
        pending: {
            label: t('admin.orders.status.pending', 'Pending'),
            color: 'warning',
            icon: '⏳',
            bgColor: '#FFF3CD',
            textColor: '#856404',
            borderColor: '#FFEAA7',
        },
        processing: {
            label: t('admin.orders.status.processing', 'Processing'),
            color: 'info',
            icon: '⚙️',
            bgColor: '#D1ECF1',
            textColor: '#0C5460',
            borderColor: '#B8DAFF',
        },
        delivering: {
            label: t('admin.orders.status.delivering', 'Delivering'),
            color: 'primary',
            icon: '🚚',
            bgColor: '#D4EDDA',
            textColor: '#155724',
            borderColor: '#C3E6CB',
        },
        delivered: {
            label: t('admin.orders.status.delivered', 'Delivered'),
            color: 'success',
            icon: '✅',
            bgColor: '#D4EDDA',
            textColor: '#155724',
            borderColor: '#C3E6CB',
        },
        cancelled: {
            label: t('admin.orders.status.cancelled', 'Cancelled'),
            color: 'danger',
            icon: '❌',
            bgColor: '#F8D7DA',
            textColor: '#721C24',
            borderColor: '#F5C6CB',
        },
        refunded: {
            label: t('admin.orders.status.refunded', 'Refunded'),
            color: 'secondary',
            icon: '💰',
            bgColor: '#E2E3E5',
            textColor: '#383D41',
            borderColor: '#D6D8DB',
        },
    };

    // Get status configuration or default
    const config = statusConfig[status] || statusConfig.pending;

    // Size classes
    const sizeClasses = {
        small: 'status-badge-small',
        medium: 'status-badge-medium',
        large: 'status-badge-large',
    };

    return (
        <span
            className={`order-status-badge ${config.color} ${sizeClasses[size]}`}
            style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
                borderColor: config.borderColor,
            }}
            title={config.label}
        >
            {showIcon && (
                <span className="status-icon" aria-hidden="true">
                    {config.icon}
                </span>
            )}
            <span className="status-text">{config.label}</span>
        </span>
    );
};

export default OrderStatusBadge;
