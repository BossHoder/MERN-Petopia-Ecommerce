import React from 'react';
import './Notification.css';

/**
 * A simple notification component to display success, error, or info messages.
 * @param {object} props - The component props.
 * @param {'success' | 'error' | 'info'} props.type - The type of the notification.
 * @param {React.ReactNode} props.children - The content of the notification.
 */
const Notification = ({ type = 'info', children }) => {
    if (!children) {
        return null;
    }

    return <div className={`notification notification-${type}`}>{children}</div>;
};

export default Notification;
