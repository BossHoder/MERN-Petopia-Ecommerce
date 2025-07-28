/**
 * Order Status Transition Logic
 * Defines allowed status transitions and validation rules
 */

// Define the order status flow
export const ORDER_STATUS_FLOW = {
    pending: ['processing', 'delivering', 'cancelled'],
    processing: ['delivering', 'cancelled'],
    delivering: ['delivered', 'cancelled'],
    delivered: ['refunded'], // Only refund is allowed after delivery
    cancelled: [], // No transitions from cancelled
    refunded: [], // No transitions from refunded
};

// Define critical status changes that require confirmation
export const CRITICAL_STATUS_CHANGES = ['cancelled', 'refunded'];

// Define status changes that require payment validation (except for COD)
export const PAYMENT_DEPENDENT_STATUSES = ['delivering', 'delivered'];

/**
 * Check if a status transition is allowed
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} - Whether the transition is allowed
 */
export const isStatusTransitionAllowed = (currentStatus, newStatus) => {
    if (!currentStatus || !newStatus) return false;
    if (currentStatus === newStatus) return false;

    const allowedTransitions = ORDER_STATUS_FLOW[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
};

/**
 * Check if a status change is critical and requires confirmation
 * @param {string} newStatus - The new status
 * @returns {boolean} - Whether confirmation is required
 */
export const requiresConfirmation = (newStatus) => {
    return CRITICAL_STATUS_CHANGES.includes(newStatus);
};

/**
 * Check if a status change requires payment validation
 * @param {string} newStatus - The new status
 * @param {boolean} isPaid - Whether the order is paid
 * @param {string} paymentMethod - Payment method (COD, CREDIT_CARD, etc.)
 * @returns {object} - Validation result with isValid and message
 */
export const validatePaymentForStatus = (newStatus, isPaid, paymentMethod) => {
    if (!PAYMENT_DEPENDENT_STATUSES.includes(newStatus)) {
        return { isValid: true, message: null };
    }

    // For COD orders, payment is not required before delivery/delivering
    if (paymentMethod === 'COD') {
        return { isValid: true, message: null };
    }

    // For other payment methods, payment is required before delivery/delivering
    if (!isPaid) {
        const statusAction = newStatus === 'delivering' ? 'start delivery' : 'mark as delivered';
        const statusName = newStatus === 'delivering' ? 'delivering' : 'delivered';

        return {
            isValid: false,
            message: `Order must be paid before you can ${statusAction}. Only COD orders can be marked as ${statusName} without payment.`,
        };
    }

    return { isValid: true, message: null };
};

/**
 * Get all allowed next statuses for a given current status
 * @param {string} currentStatus - Current order status
 * @returns {string[]} - Array of allowed next statuses
 */
export const getAllowedNextStatuses = (currentStatus) => {
    return ORDER_STATUS_FLOW[currentStatus] || [];
};

/**
 * Get status transition validation result
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @param {boolean} isPaid - Whether the order is paid
 * @param {string} paymentMethod - Payment method
 * @returns {object} - Comprehensive validation result
 */
export const validateStatusTransition = (currentStatus, newStatus, isPaid, paymentMethod) => {
    // Check if transition is allowed
    if (!isStatusTransitionAllowed(currentStatus, newStatus)) {
        return {
            isValid: false,
            requiresConfirmation: false,
            message: `Cannot change status from "${currentStatus}" to "${newStatus}". Invalid transition.`,
            allowedStatuses: getAllowedNextStatuses(currentStatus),
        };
    }

    // Check payment requirements
    const paymentValidation = validatePaymentForStatus(newStatus, isPaid, paymentMethod);
    if (!paymentValidation.isValid) {
        return {
            isValid: false,
            requiresConfirmation: false,
            message: paymentValidation.message,
            allowedStatuses: getAllowedNextStatuses(currentStatus),
        };
    }

    // Check if confirmation is required
    const needsConfirmation = requiresConfirmation(newStatus);

    return {
        isValid: true,
        requiresConfirmation: needsConfirmation,
        message: needsConfirmation
            ? `Are you sure you want to ${newStatus} this order? This action cannot be undone.`
            : null,
        allowedStatuses: getAllowedNextStatuses(currentStatus),
    };
};

/**
 * Get user-friendly status transition messages
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {object} - Messages for different scenarios
 */
export const getStatusTransitionMessages = (currentStatus, newStatus) => {
    const messages = {
        pending: {
            processing: 'Order will be marked as being processed',
            cancelled: 'Order will be cancelled and customer will be notified',
        },
        processing: {
            delivering: 'Order will be marked as out for delivery',
            cancelled: 'Order will be cancelled and customer will be notified',
        },
        delivering: {
            delivered: 'Order will be marked as successfully delivered',
            cancelled: 'Order will be cancelled and customer will be notified',
        },
        delivered: {
            refunded: 'Order will be refunded and payment will be processed',
        },
    };

    return messages[currentStatus]?.[newStatus] || `Order status will be changed to ${newStatus}`;
};

/**
 * Get status color and icon configuration
 * @param {string} status - Order status
 * @returns {object} - Status display configuration
 */
export const getStatusDisplayConfig = (status) => {
    const configs = {
        pending: { color: '#856404', bgColor: '#FFF3CD', icon: '⏳', severity: 'warning' },
        processing: { color: '#0C5460', bgColor: '#D1ECF1', icon: '⚙️', severity: 'info' },
        delivering: { color: '#155724', bgColor: '#D4EDDA', icon: '🚚', severity: 'primary' },
        delivered: { color: '#155724', bgColor: '#D4EDDA', icon: '✅', severity: 'success' },
        cancelled: { color: '#721C24', bgColor: '#F8D7DA', icon: '❌', severity: 'danger' },
        refunded: { color: '#383D41', bgColor: '#E2E3E5', icon: '💰', severity: 'secondary' },
    };

    return configs[status] || configs.pending;
};
