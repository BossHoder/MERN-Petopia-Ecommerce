import { toast } from 'react-toastify';

// Store active toasts to prevent duplicates
const activeToasts = new Set();

/**
 * Show success toast with duplicate prevention
 * @param {string} message - Toast message
 * @param {Object} options - Toast options
 * @returns {string|null} - Toast ID or null if duplicate
 */
export const showSuccessToast = (message, options = {}) => {
    // Create a unique key for the message
    const messageKey = `success_${message}`;

    // Check if this message is already being displayed
    if (activeToasts.has(messageKey)) {
        return null;
    }

    // Add to active toasts
    activeToasts.add(messageKey);

    // Show toast with cleanup on close
    const toastId = toast.success(message, {
        ...options,
        onClose: () => {
            activeToasts.delete(messageKey);
            if (options.onClose) {
                options.onClose();
            }
        },
        autoClose: options.autoClose || 3000,
    });

    return toastId;
};

/**
 * Show error toast with duplicate prevention
 * @param {string} message - Toast message
 * @param {Object} options - Toast options
 * @returns {string|null} - Toast ID or null if duplicate
 */
export const showErrorToast = (message, options = {}) => {
    // Create a unique key for the message
    const messageKey = `error_${message}`;

    // Check if this message is already being displayed
    if (activeToasts.has(messageKey)) {
        return null;
    }

    // Add to active toasts
    activeToasts.add(messageKey);

    // Show toast with cleanup on close
    const toastId = toast.error(message, {
        ...options,
        onClose: () => {
            activeToasts.delete(messageKey);
            if (options.onClose) {
                options.onClose();
            }
        },
        autoClose: options.autoClose || 5000, // Error toasts stay longer
    });

    return toastId;
};

/**
 * Show info toast with duplicate prevention
 * @param {string} message - Toast message
 * @param {Object} options - Toast options
 * @returns {string|null} - Toast ID or null if duplicate
 */
export const showInfoToast = (message, options = {}) => {
    // Create a unique key for the message
    const messageKey = `info_${message}`;

    // Check if this message is already being displayed
    if (activeToasts.has(messageKey)) {
        return null;
    }

    // Add to active toasts
    activeToasts.add(messageKey);

    // Show toast with cleanup on close
    const toastId = toast.info(message, {
        ...options,
        onClose: () => {
            activeToasts.delete(messageKey);
            if (options.onClose) {
                options.onClose();
            }
        },
        autoClose: options.autoClose || 4000,
    });

    return toastId;
};

/**
 * Show warning toast with duplicate prevention
 * @param {string} message - Toast message
 * @param {Object} options - Toast options
 * @returns {string|null} - Toast ID or null if duplicate
 */
export const showWarningToast = (message, options = {}) => {
    // Create a unique key for the message
    const messageKey = `warning_${message}`;

    // Check if this message is already being displayed
    if (activeToasts.has(messageKey)) {
        return null;
    }

    // Add to active toasts
    activeToasts.add(messageKey);

    // Show toast with cleanup on close
    const toastId = toast.warn(message, {
        ...options,
        onClose: () => {
            activeToasts.delete(messageKey);
            if (options.onClose) {
                options.onClose();
            }
        },
        autoClose: options.autoClose || 4000,
    });

    return toastId;
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
    toast.dismiss();
    activeToasts.clear();
};

/**
 * Check if a specific toast message is currently active
 * @param {string} message - Toast message to check
 * @param {string} type - Toast type (success, error, info, warning)
 * @returns {boolean} - Whether the toast is active
 */
export const isToastActive = (message, type = 'success') => {
    const messageKey = `${type}_${message}`;
    return activeToasts.has(messageKey);
};

/**
 * Show toast with auto-reload functionality
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info, warning)
 * @param {Function} reloadCallback - Function to call for reload
 * @param {number} reloadDelay - Delay before reload in milliseconds
 * @param {Object} options - Additional toast options
 */
export const showToastWithReload = (
    message,
    type = 'success',
    reloadCallback,
    reloadDelay = 1500,
    options = {},
) => {
    const toastFunction =
        {
            success: showSuccessToast,
            error: showErrorToast,
            info: showInfoToast,
            warning: showWarningToast,
        }[type] || showSuccessToast;

    // Add special class for auto-reload toasts
    const enhancedOptions = {
        ...options,
        className: `toast-with-reload ${options.className || ''}`.trim(),
        onClose: () => {
            if (options.onClose) {
                options.onClose();
            }
        },
    };

    const toastId = toastFunction(message, enhancedOptions);

    // Auto-reload after delay if toast was shown
    if (toastId && reloadCallback) {
        setTimeout(() => {
            reloadCallback();
        }, reloadDelay);
    }

    return toastId;
};
