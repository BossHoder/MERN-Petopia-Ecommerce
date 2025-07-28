import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import { getOrderDetails, updateOrderStatus } from '../../../store/actions/adminActions';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import OrderStatusBadge from '../../../components/Admin/OrderStatusBadge/OrderStatusBadge';
import './OrderDetails.css';

const OrderDetails = ({ orderId, onClose }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();

    // Redux state
    const {
        orderDetails,
        orderDetailsLoading,
        orderUpdateLoading,
        error,
        success
    } = useSelector((state) => state.admin);

    // Local state
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Load order details
    useEffect(() => {
        if (orderId) {
            dispatch(getOrderDetails(orderId));
        }
    }, [dispatch, orderId]);

    // Handle success/error messages
    useEffect(() => {
        if (success) {
            toast.success(success);
            setShowStatusUpdate(false);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('admin.dashboard', 'Dashboard'), path: '/admin/dashboard' },
        { label: t('admin.orders.title', 'Orders Management'), path: '/admin/orders' },
        { label: t('admin.orders.orderDetails', 'Order Details'), path: '#' }
    ];

    // Status options for update
    const statusOptions = [
        { value: 'pending', label: t('admin.orders.status.pending', 'Pending') },
        { value: 'processing', label: t('admin.orders.status.processing', 'Processing') },
        { value: 'shipped', label: t('admin.orders.status.shipped', 'Shipped') },
        { value: 'delivered', label: t('admin.orders.status.delivered', 'Delivered') },
        { value: 'cancelled', label: t('admin.orders.status.cancelled', 'Cancelled') }
    ];

    const handleStatusUpdate = () => {
        if (newStatus && newStatus !== orderDetails?.orderStatus) {
            dispatch(updateOrderStatus(orderId, newStatus));
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
                    <button
                        onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                        className="btn-primary"
                        disabled={orderUpdateLoading}
                    >
                        {t('admin.orders.updateStatus', 'Update Status')}
                    </button>
                    <button onClick={onClose} className="btn-secondary">
                        {t('common.close', 'Close')}
                    </button>
                </div>
            </div>

            {/* Status Update Section */}
            {showStatusUpdate && (
                <div className="status-update-section">
                    <div className="status-update-form">
                        <label className="form-label">
                            {t('admin.orders.newStatus', 'New Status')}
                        </label>
                        <div className="status-update-controls">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="status-select"
                            >
                                <option value="">
                                    {t('admin.orders.selectStatus', 'Select new status')}
                                </option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || orderUpdateLoading}
                                className="btn-primary"
                            >
                                {orderUpdateLoading ? t('common.updating', 'Updating...') : t('common.update', 'Update')}
                            </button>
                            <button
                                onClick={() => setShowStatusUpdate(false)}
                                className="btn-secondary"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Content */}
            <div className="order-details-content">
                {/* Order Summary */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.orderSummary', 'Order Summary')}
                    </h2>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">{t('admin.orders.orderDate', 'Order Date')}</span>
                            <span className="value">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">{t('admin.orders.paymentMethod', 'Payment Method')}</span>
                            <span className="value">{order.paymentMethod?.toUpperCase()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">{t('admin.orders.paymentStatus', 'Payment Status')}</span>
                            <span className={`value ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                {order.isPaid ? t('admin.orders.paid', 'Paid') : t('admin.orders.unpaid', 'Unpaid')}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">{t('admin.orders.deliveryStatus', 'Delivery Status')}</span>
                            <span className={`value ${order.isDelivered ? 'delivered' : 'pending'}`}>
                                {order.isDelivered ? t('admin.orders.delivered', 'Delivered') : t('admin.orders.pending', 'Pending')}
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
                            <span className="label">{t('admin.orders.customerEmail', 'Email')}</span>
                            <span className="value">
                                {order.user ? order.user.email : order.guestInfo?.email || 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('admin.orders.customerPhone', 'Phone')}</span>
                            <span className="value">
                                {order.guestInfo?.phoneNumber || order.shippingAddress?.phoneNumber || 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('admin.orders.customerType', 'Customer Type')}</span>
                            <span className="value">
                                {order.isGuestOrder ? t('admin.orders.guest', 'Guest') : t('admin.orders.registered', 'Registered')}
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
                            <strong>{t('admin.orders.phone', 'Phone')}:</strong> {order.shippingAddress?.phoneNumber}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="details-section">
                    <h2 className="section-title">
                        {t('admin.orders.orderItems', 'Order Items')}
                    </h2>
                    <div className="order-items">
                        {order.orderItems?.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="item-image">
                                    <img
                                        src={item.image || '/placeholder.jpg'}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <div className="item-details">
                                    <h3 className="item-name">{item.name}</h3>
                                    <div className="item-meta">
                                        <span className="item-price">${item.price?.toFixed(2)}</span>
                                        <span className="item-quantity">x{item.quantity}</span>
                                        <span className="item-total">
                                            ${(item.price * item.quantity)?.toFixed(2)}
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
                            <span className="value">${order.itemsPrice?.toFixed(2)}</span>
                        </div>
                        <div className="total-item">
                            <span className="label">{t('admin.orders.shipping', 'Shipping')}</span>
                            <span className="value">${order.shippingPrice?.toFixed(2)}</span>
                        </div>
                        <div className="total-item">
                            <span className="label">{t('admin.orders.tax', 'Tax')}</span>
                            <span className="value">${order.taxPrice?.toFixed(2)}</span>
                        </div>
                        <div className="total-item total">
                            <span className="label">{t('admin.orders.total', 'Total')}</span>
                            <span className="value">${order.totalPrice?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
