import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import './styles.css';

/**
 * Enhanced Pet-themed Loader Component
 * @param {string} variant - Loading animation variant ('paws', 'heart', 'bone', 'minimal', 'dots')
 * @param {string} size - Size of the loader ('sm', 'md', 'lg')
 * @param {string} message - Custom loading message
 * @param {boolean} overlay - Whether to show as full-screen overlay
 * @param {string} color - Color theme ('orange', 'brown', 'cream')
 */
const Loader = ({
    variant = 'paws',
    size = 'md',
    message,
    overlay = false,
    color = 'orange',
    ...props
}) => {
    const { t } = useTranslation('common');

    const defaultMessage = t('common.loading', 'Loading...');
    const loadingMessage = message || defaultMessage;

    const renderLoader = () => {
        switch (variant) {
            case 'paws':
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

            case 'heart':
                return (
                    <div className={`heart-loader ${size} ${color}`}>
                        <div className="beating-heart">
                            <div className="heart">💖</div>
                        </div>
                        <p className="loader-message">{loadingMessage}</p>
                    </div>
                );

            case 'bone':
                return (
                    <div className={`bone-loader ${size} ${color}`}>
                        <div className="spinning-bone">
                            <div className="bone">🦴</div>
                        </div>
                        <p className="loader-message">{loadingMessage}</p>
                    </div>
                );

            case 'dots':
                return (
                    <div className={`dots-loader ${size} ${color}`}>
                        <div className="bouncing-dots">
                            <div className="dot dot-1"></div>
                            <div className="dot dot-2"></div>
                            <div className="dot dot-3"></div>
                        </div>
                        <p className="loader-message">{loadingMessage}</p>
                    </div>
                );

            case 'minimal':
                return (
                    <div className={`minimal-loader ${size} ${color}`}>
                        <div className="spinner-ring">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                        </div>
                        <p className="loader-message">{loadingMessage}</p>
                    </div>
                );

            default:
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
        }
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
    variant: PropTypes.oneOf(['paws', 'heart', 'bone', 'minimal', 'dots']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    message: PropTypes.string,
    overlay: PropTypes.bool,
    color: PropTypes.oneOf(['orange', 'brown', 'cream']),
};

export default Loader;
