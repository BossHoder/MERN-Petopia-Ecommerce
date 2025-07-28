import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getOrderDetails } from '../../store/actions/orderActions';
import Loader from '../../components/Loader/Loader';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import { useTranslation } from 'react-i18next';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id: orderId } = useParams();
    const dispatch = useDispatch();
    const { t } = useTranslation('common');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('order', orderId);

    const { order, loading, error } = useSelector((state) => state.orderDetails);

    useEffect(() => {
        if (!order || order._id !== orderId) {
            dispatch(getOrderDetails(orderId));
        }
    }, [dispatch, orderId, order]);

    return loading ? (
        <Loader />
    ) : error ? (
        <p className="error-message">{error}</p>
    ) : (
        <div className="order-details-container">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.orderNavigation', 'Order navigation')}
            />

            <h1>
                {t('orderDetails.title', 'Order #')}
                {order._id}
            </h1>
            <div className="order-details-grid">
                <div className="order-main-content">
                    <div className="order-section">
                        <h2>{t('orderDetails.shipping', 'Shipping')}</h2>
                        <p>
                            <strong>{t('orderDetails.name', 'Name')}: </strong> {order.user.name}
                        </p>
                        <p>
                            <strong>{t('orderDetails.email', 'Email')}: </strong>{' '}
                            <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                        </p>
                        <p>
                            <strong>{t('orderDetails.address', 'Address')}: </strong>
                            {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        {/* Delivery Status */}
                        {order.isDelivered ? (
                            <div className="alert alert-success">
                                {t('orderDetails.deliveredOn', 'Delivered on')}{' '}
                                {moment(order.deliveredAt).format('LLLL')}
                            </div>
                        ) : (
                            <div className="alert alert-info">
                                {t('orderDetails.notDelivered', 'Not Delivered')}
                            </div>
                        )}

                        {/* Estimated Delivery Time */}
                        {!order.isDelivered && order.estimatedDeliveryDate && (
                            <div className="delivery-estimate">
                                <h4>{t('orderDetails.estimatedDelivery', 'Estimated Delivery')}</h4>
                                <p className="delivery-date">
                                    <strong>
                                        {moment(order.estimatedDeliveryDate).format(
                                            'dddd, MMMM Do YYYY',
                                        )}
                                    </strong>
                                </p>
                                <p className="delivery-range">
                                    {order.estimatedDeliveryRange && (
                                        <>
                                            {t('orderDetails.deliveryRange', 'Delivery window')}:{' '}
                                            {moment(order.estimatedDeliveryRange.start).format(
                                                'MMM Do',
                                            )}{' '}
                                            -{' '}
                                            {moment(order.estimatedDeliveryRange.end).format(
                                                'MMM Do, YYYY',
                                            )}
                                        </>
                                    )}
                                </p>
                                <p className="delivery-note">
                                    {t(
                                        'orderDetails.businessDaysNote',
                                        '2-4 business days from order date',
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="order-section">
                        <h2>{t('orderDetails.paymentMethod', 'Payment Method')}</h2>
                        <p>
                            <strong>{t('orderDetails.method', 'Method')}: </strong>
                            {order.paymentMethod}
                        </p>
                        {order.isPaid ? (
                            <div className="alert alert-success">
                                {t('orderDetails.paidOn', 'Paid on')}{' '}
                                {moment(order.paidAt).format('LLLL')}
                            </div>
                        ) : (
                            <div className="alert alert-danger">
                                {t('orderDetails.notPaid', 'Not Paid')}
                            </div>
                        )}
                    </div>

                    <div className="order-section">
                        <h2>{t('orderDetails.orderItems', 'Order Items')}</h2>
                        <div className="order-items-list">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="order-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="order-item-name">
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                    </div>
                                    <div className="order-item-total">
                                        {item.quantity} x ${item.price.toFixed(2)} = $
                                        {(item.quantity * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="order-summary-card">
                    <h2>{t('orderDetails.orderSummary', 'Order Summary')}</h2>
                    <ul className="summary-list">
                        <li>
                            <span>{t('orderDetails.summary.items', 'Items')}</span>
                            <span>${order.itemsPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>{t('orderDetails.summary.shipping', 'Shipping')}</span>
                            <span>${order.shippingPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>{t('orderDetails.summary.tax', 'Tax')}</span>
                            <span>${order.taxPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>{t('orderDetails.summary.total', 'Total')}</span>
                            <span>${order.totalPrice.toFixed(2)}</span>
                        </li>
                    </ul>
                    {/* PayPal Button will go here */}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
