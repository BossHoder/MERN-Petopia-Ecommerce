import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../../../hooks/useI18n';
import { showSuccessToast, showErrorToast, showToastWithReload } from '../../../utils/toastUtils';
import {
    getOrderDetails,
    updateOrderStatus,
    updatePaymentStatus,
} from '../../../store/actions/adminActions';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import OrderStatusBadge from '../../../components/Admin/OrderStatusBadge/OrderStatusBadge';
import OrderStatusControl from '../../../components/Admin/OrderStatusControl/OrderStatusControl';
import PaymentStatusControl from '../../../components/Admin/PaymentStatusControl/PaymentStatusControl';
import { formatPrice } from '../../../utils/displayUtils';
import './OrderDetails.css';

const OrderDetails = ({ orderId, onClose }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();

    // Redux state
    const { orderDetails, orderDetailsLoading, orderUpdateLoading, error, success } = useSelector(
        (state) => state.admin,
    );

    // Local state - removed unused status update state

    // Load order details
    useEffect(() => {
        if (orderId) {
            dispatch(getOrderDetails(orderId));
        }
    }, [dispatch, orderId]);

    // Handle success/error messages
    useEffect(() => {
        if (success) {
            showSuccessToast(success);
        }
        if (error) {
            showErrorToast(error);
        }
    }, [success, error]);

    // Breadcrumb items
    const breadcrumbItems = [
        { name: t('admin.title', 'Admin Dashboard'), path: '/admin/dashboard' },
        { name: t('admin.orders.title', 'Orders Management'), path: '/admin/orders' },
        { name: t('admin.orders.orderDetails', 'Order Details'), path: '#' },
    ];

    // Auto-reload function
    const reloadOrderDetails = () => {
        dispatch(getOrderDetails(orderId));
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await dispatch(updateOrderStatus(orderId, newStatus));
            showToastWithReload(
                t('admin.orders.statusUpdateSuccess', 'Order status updated successfully'),
                'success',
                reloadOrderDetails,
                1500,
            );
        } catch (error) {
            showErrorToast(t('admin.orders.statusUpdateError', 'Failed to update order status'));
        }
    };

    const handlePaymentStatusUpdate = async (orderId, isPaid) => {
        try {
            await dispatch(updatePaymentStatus(orderId, isPaid));
            showToastWithReload(
                t(
                    'admin.orders.paymentStatusControl.updateSuccess',
                    'Payment status updated successfully',
                ),
                'success',
                reloadOrderDetails,
                1500,
            );
        } catch (error) {
            showErrorToast(
                t(
                    'admin.orders.paymentStatusControl.updateError',
                    'Failed to update payment status',
                ),
            );
        }
    };

    if (orderDetailsLoading) {
        return (
            <div className="order-details-loading">
                <div className="loading-spinner"></div>
                <p>{t('admin.orders.loadingDetails', 'Loading order details...')}</p>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className="order-details-error">
                <p>{t('admin.orders.orderNotFound', 'Order not found')}</p>
                <button onClick={onClose} className="btn-secondary">
                    {t('common.goBack', 'Go Back')}
                </button>
            </div>
        );
    }

    const order = orderDetails;

    return (
        <div className="order-details">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.orderDetails', 'Order details navigation')}
            />

            {/* Header */}
            <div className="order-details-header">
                <div className="header-left">
                    <h1 className="page-title">
                        {t('admin.orders.orderDetails', 'Order Details')}
                    </h1>
                    <div className="order-meta">
                        <span className="order-number">#{order.orderNumber}</span>
                        <OrderStatusBadge status={order.orderStatus} size="large" />
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={onClose} className="btn-secondary">
                        {t('common.close', 'Close')}
                    </button>
                </div>
            </div>

            {/* Status and Payment Controls Section */}
            <div className="status-controls-section">
                <div className="controls-grid">
                    <div className="control-group">
                        <h4 className="control-title">
                            {t('admin.orders.status.title', 'Order Status')}
                        </h4>
                        <OrderStatusControl
                            currentStatus={orderDetails?.orderStatus}
                            orderId={orderId}
                            orderNumber={orderDetails?.orderNumber}
                            isPaid={orderDetails?.isPaid}
                            paymentMethod={orderDetails?.paymentMethod}
                            onStatusUpdate={handleStatusUpdate}
                            size="large"
                        />
                    </div>

                    <div className="control-group">
                        <h4 className="control-title">
                            {t('admin.orders.paymentStatusControl.title', 'Payment Status')}
                        </h4>
                        <PaymentStatusControl
                            currentStatus={orderDetails?.isPaid}
                            orderId={orderId}
                            orderStatus={orderDetails?.orderStatus}
                            onStatusUpdate={handlePaymentStatusUpdate}
                            size="large"
                        />
                    </div>
                </div>
            </div>

            {/* Order Content */}
            <div className="order-details-content">
                {/* Order Summary */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.orderSummary', 'Order Summary')}
                    </h2>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">
                                {t('admin.orders.orderDate', 'Order Date')}
                            </span>
                            <span className="value">
                                {new Date(order.createdAt).toLocaleString()}
                            </span>
                        </div>

                        {/* Estimated Delivery Information */}
                        {order.estimatedDeliveryDate && (
                            <div className="summary-item">
                                <span className="label">
                                    {t('admin.orders.estimatedDelivery', 'Estimated Delivery')}
                                </span>
                                <span className="value delivery-estimate">
                                    {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                    {order.estimatedDeliveryRange && (
                                        <small className="delivery-range">
                                            (
                                            {new Date(
                                                order.estimatedDeliveryRange.start,
                                            ).toLocaleDateString()}{' '}
                                            -{' '}
                                            {new Date(
                                                order.estimatedDeliveryRange.end,
                                            ).toLocaleDateString()}
                                            )
                                        </small>
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="summary-item">
                            <span className="label">
                                {t('admin.orders.paymentMethod', 'Payment Method')}
                            </span>
                            <span className="value">{order.paymentMethod?.toUpperCase()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">
                                {t('admin.orders.paymentStatus', 'Payment Status')}
                            </span>
                            <span className={`value ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                {order.isPaid
                                    ? t('admin.orders.paid', 'Paid')
                                    : t('admin.orders.unpaid', 'Unpaid')}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">
                                {t('admin.orders.deliveryStatus', 'Delivery Status')}
                            </span>
                            <span
                                className={`value ${order.isDelivered ? 'delivered' : 'pending'}`}
                            >
                                {order.isDelivered
                                    ? t('admin.orders.delivered', 'Delivered')
                                    : t('admin.orders.pending', 'Pending')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.customerInfo', 'Customer Information')}
                    </h2>
                    <div className="customer-info">
                        <div className="info-item">
                            <span className="label">{t('admin.orders.customerName', 'Name')}</span>
                            <span className="value">
                                {order.user ? order.user.name : order.guestInfo?.fullName || 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">
                                {t('admin.orders.customerEmail', 'Email')}
                            </span>
                            <span className="value">
                                {order.user ? order.user.email : order.guestInfo?.email || 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">
                                {t('admin.orders.customerPhone', 'Phone')}
                            </span>
                            <span className="value">
                                {order.guestInfo?.phoneNumber ||
                                    order.shippingAddress?.phoneNumber ||
                                    'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">
                                {t('admin.orders.customerType', 'Customer Type')}
                            </span>
                            <span className="value">
                                {order.isGuestOrder
                                    ? t('admin.orders.guest', 'Guest')
                                    : t('admin.orders.registered', 'Registered')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.shippingAddress', 'Shipping Address')}
                    </h2>
                    <div className="address-info">
                        <p className="address-line">
                            <strong>{order.shippingAddress?.fullName}</strong>
                        </p>
                        <p className="address-line">{order.shippingAddress?.address}</p>
                        <p className="address-line">
                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                        </p>
                        <p className="address-line">{order.shippingAddress?.country}</p>
                        <p className="address-line">
                            <strong>{t('admin.orders.phone', 'Phone')}:</strong>{' '}
                            {order.shippingAddress?.phoneNumber}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="details-section">
                    <h2 className="section-title">{t('admin.orders.orderItems', 'Order Items')}</h2>
                    <div className="order-items">
                        {order.orderItems?.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="item-image">
                                    <img
                                        src={item.image || '/placeholder.svg'}
                                        alt={item.name}
                                        onError={(e) => {
                                            if (
                                                e.target.src !==
                                                window.location.origin + '/placeholder.svg'
                                            ) {
                                                e.target.src = '/placeholder.svg';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="item-details">
                                    <h3 className="item-name">{item.name}</h3>
                                    <div className="item-meta">
                                        <span className="item-price">
                                            {formatPrice(item.price)}
                                        </span>
                                        <span className="item-quantity">x{item.quantity}</span>
                                        <span className="item-total">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Totals */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.orderTotals', 'Order Totals')}
                    </h2>
                    <div className="order-totals">
                        <div className="total-item">
                            <span className="label">{t('admin.orders.subtotal', 'Subtotal')}</span>
                            <span className="value">{formatPrice(order.itemsPrice)}</span>
                        </div>
                        <div className="total-item">
                            <span className="label">{t('admin.orders.shipping', 'Shipping')}</span>
                            <span className="value">{formatPrice(order.shippingPrice)}</span>
                        </div>
                        <div className="total-item">
                            <span className="label">{t('admin.orders.tax', 'Tax')}</span>
                            <span className="value">{formatPrice(order.taxPrice)}</span>
                        </div>
                        <div className="total-item total">
                            <span className="label">{t('admin.orders.total', 'Total')}</span>
                            <span className="value">{formatPrice(order.totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
