import OrderAuditLog from '../models/OrderAuditLog.js';

/**
 * Log order status change
 * @param {Object} params - Logging parameters
 * @param {string} params.orderId - Order ID
 * @param {string} params.orderNumber - Order number
 * @param {string} params.oldStatus - Previous status
 * @param {string} params.newStatus - New status
 * @param {string} params.changedBy - User ID who made the change
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 * @param {string} params.notes - Optional notes
 */
export const logOrderStatusChange = async (params) => {
    const {
        orderId,
        orderNumber,
        oldStatus,
        newStatus,
        changedBy,
        ipAddress = null,
        userAgent = null,
        notes = null,
    } = params;

    return await OrderAuditLog.logChange({
        orderId,
        orderNumber,
        action: 'status_change',
        field: 'orderStatus',
        oldValue: oldStatus,
        newValue: newStatus,
        changedBy,
        changedByRole: 'admin',
        ipAddress,
        userAgent,
        notes,
        metadata: {
            timestamp: new Date(),
            changeType: 'status_transition',
        },
    });
};

/**
 * Log payment status change
 * @param {Object} params - Logging parameters
 * @param {string} params.orderId - Order ID
 * @param {string} params.orderNumber - Order number
 * @param {boolean} params.oldPaymentStatus - Previous payment status
 * @param {boolean} params.newPaymentStatus - New payment status
 * @param {string} params.changedBy - User ID who made the change
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 * @param {string} params.notes - Optional notes
 */
export const logPaymentStatusChange = async (params) => {
    const {
        orderId,
        orderNumber,
        oldPaymentStatus,
        newPaymentStatus,
        changedBy,
        ipAddress = null,
        userAgent = null,
        notes = null,
    } = params;

    return await OrderAuditLog.logChange({
        orderId,
        orderNumber,
        action: 'payment_status_change',
        field: 'isPaid',
        oldValue: oldPaymentStatus,
        newValue: newPaymentStatus,
        changedBy,
        changedByRole: 'admin',
        ipAddress,
        userAgent,
        notes,
        metadata: {
            timestamp: new Date(),
            changeType: 'payment_status_change',
            paidAt: newPaymentStatus ? new Date() : null,
        },
    });
};

/**
 * Log general order update
 * @param {Object} params - Logging parameters
 * @param {string} params.orderId - Order ID
 * @param {string} params.orderNumber - Order number
 * @param {string} params.field - Field that was changed
 * @param {any} params.oldValue - Previous value
 * @param {any} params.newValue - New value
 * @param {string} params.changedBy - User ID who made the change
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 * @param {string} params.notes - Optional notes
 */
export const logOrderUpdate = async (params) => {
    const {
        orderId,
        orderNumber,
        field,
        oldValue,
        newValue,
        changedBy,
        ipAddress = null,
        userAgent = null,
        notes = null,
    } = params;

    return await OrderAuditLog.logChange({
        orderId,
        orderNumber,
        action: 'order_updated',
        field,
        oldValue,
        newValue,
        changedBy,
        changedByRole: 'admin',
        ipAddress,
        userAgent,
        notes,
        metadata: {
            timestamp: new Date(),
            changeType: 'general_update',
        },
    });
};

/**
 * Get order audit history
 * @param {string} orderId - Order ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Array} Array of audit log entries
 */
export const getOrderAuditHistory = async (orderId, limit = 50) => {
    return await OrderAuditLog.getOrderHistory(orderId, limit);
};

/**
 * Get formatted audit history for display
 * @param {string} orderId - Order ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Array} Array of formatted audit log entries
 */
export const getFormattedOrderHistory = async (orderId, limit = 50) => {
    try {
        const history = await getOrderAuditHistory(orderId, limit);
        
        return history.map(entry => ({
            id: entry._id,
            action: entry.action,
            message: entry.getDisplayMessage ? entry.getDisplayMessage() : `${entry.field} changed`,
            timestamp: entry.createdAt,
            formattedDate: entry.createdAt.toLocaleString(),
            changedBy: entry.changedBy ? {
                id: entry.changedBy._id,
                name: entry.changedBy.name,
                email: entry.changedBy.email,
            } : null,
            oldValue: entry.oldValue,
            newValue: entry.newValue,
            notes: entry.notes,
            metadata: entry.metadata,
        }));
    } catch (error) {
        console.error('Failed to get formatted order history:', error);
        return [];
    }
};

/**
 * Extract request metadata for audit logging
 * @param {Object} req - Express request object
 * @returns {Object} Metadata object
 */
export const extractRequestMetadata = (req) => {
    return {
        ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || null,
        userAgent: req.get('User-Agent') || null,
    };
};
