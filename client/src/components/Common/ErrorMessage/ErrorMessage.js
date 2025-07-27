import React from 'react';
import './styles.css';

const ErrorMessage = ({ message, onRetry, showRetry = true }) => {
    return (
        <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
                <h3 className="error-title">Something went wrong</h3>
                <p className="error-text">{message}</p>
                {showRetry && onRetry && (
                    <button 
                        className="error-retry-btn"
                        onClick={onRetry}
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
