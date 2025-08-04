import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import './styles.css';

/**
 * Pet-themed Paws Loader Component
 * @param {string} size - Size of the loader ('sm', 'md', 'lg')
 * @param {string} message - Custom loading message
 * @param {boolean} overlay - Whether to show as full-screen overlay
 * @param {string} color - Color theme ('orange', 'brown', 'cream')
 */
const Loader = ({ size = 'md', message, overlay = false, color = 'orange', ...props }) => {
    const { t } = useTranslation('common');

    const defaultMessage = t('common.loading');
    const loadingMessage = message || defaultMessage;

    const renderLoader = () => {
        return (
            <div className={`paw-loader ${size} ${color}`}>
                <div className="paw-prints">
                    <div className="paw-print paw-1">🐾</div>
                    <div className="paw-print paw-2">🐾</div>
                    <div className="paw-print paw-3">🐾</div>
                    <div className="paw-print paw-4">🐾</div>
                </div>
                <p className="loader-message">{loadingMessage}</p>
            </div>
        );
    };

    const containerClasses = `
        loader-container
        ${overlay ? 'loader-overlay' : ''}
        ${size}
        ${color}
    `.trim();

    return (
        <div
            className={containerClasses}
            role="status"
            aria-live="polite"
            aria-label={loadingMessage}
            {...props}
        >
            <div className="loader-content" aria-label={loadingMessage}>
                {renderLoader()}
            </div>
        </div>
    );
};

Loader.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    message: PropTypes.string,
    overlay: PropTypes.bool,
    color: PropTypes.oneOf(['orange', 'brown', 'cream']),
};

export default Loader;
