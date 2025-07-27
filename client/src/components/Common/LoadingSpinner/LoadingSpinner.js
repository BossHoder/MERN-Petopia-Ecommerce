import React from 'react';
import './styles.css';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    return (
        <div className={`loading-spinner ${size}`}>
            <div className="spinner"></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
