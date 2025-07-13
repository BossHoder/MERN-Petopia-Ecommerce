// ===========================================
// ORDER DATA TRANSFER OBJECTS
// ===========================================
// This file contains DTOs for transforming order data

export const orderItemDto = (item) => {
    return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
    };
};

export const orderDto = (order) => {
    return {
        id: order._id,
        orderNumber: order.orderNumber,
        username: order.username,
        items: order.items.map((item) => orderItemDto(item)),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        appliedCoupon: order.appliedCoupon,
        pricing: order.pricing,
        status: order.status,
        currentStatus: order.currentStatus,
        statusHistory: order.statusHistory,
        shippingInfo: {
            shippingCompany: order.shippingCompany,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            actualDelivery: order.actualDelivery,
        },
        refundInfo: order.refundInfo,
        cancellationReason: order.cancellationReason,
        totalItems: order.totalItems,
        totalAmount: order.totalAmount,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        canBeCancelled: order.canBeCancelled,
        canBeRefunded: order.canBeRefunded,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
};

export const ordersDto = (orders) => {
    return orders.map((order) => orderDto(order));
};

// Simplified DTO for order lists
export const orderListDto = (order) => {
    return {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        currentStatus: order.currentStatus,
        totalAmount: order.totalAmount,
        totalItems: order.totalItems,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
};

export const ordersListDto = (orders) => {
    return orders.map((order) => orderListDto(order));
};

// Admin DTO (includes internal notes)
export const adminOrderDto = (order) => {
    return {
        ...orderDto(order),
        internalNotes: order.internalNotes,
        paymentDetails: order.paymentDetails,
    };
};

// Customer DTO (excludes sensitive info)
export const customerOrderDto = (order) => {
    const dto = orderDto(order);
    // Remove sensitive admin data
    delete dto.internalNotes;
    delete dto.paymentDetails;
    return dto;
};

// Status history DTO
export const statusHistoryDto = (statusHistory) => {
    return statusHistory.map((status) => ({
        status: status.status,
        comment: status.comment,
        changedBy: status.changedBy,
        timestamp: status.timestamp,
    }));
};
