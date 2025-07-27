import React, { useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Toast = ({ message, type = 'info', useI18n: shouldUseI18n = false, fallback = '', onClose, duration = 4000 }) => {
    const { t } = useI18n();

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getDisplayMessage = () => {
        if (shouldUseI18n) {
            return t(message, fallback || message);
        }
        return message;
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                <span className="toast-icon">{getIcon()}</span>
                <span className="toast-message">{getDisplayMessage()}</span>
            </div>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                ×
            </button>
        </div>
    );
};

export default Toast;
