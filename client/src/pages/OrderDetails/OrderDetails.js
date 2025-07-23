import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getOrderDetails } from '../../store/actions/orderActions';
import Loader from '../../components/Loader/Loader';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id: orderId } = useParams();
    const dispatch = useDispatch();

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
            <h1>Order #{order._id}</h1>
            <div className="order-details-grid">
                <div className="order-main-content">
                    <div className="order-section">
                        <h2>Shipping</h2>
                        <p>
                            <strong>Name: </strong> {order.user.name}
                        </p>
                        <p>
                            <strong>Email: </strong>{' '}
                            <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                        </p>
                        <p>
                            <strong>Address: </strong>
                            {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? (
                            <div className="alert alert-success">
                                Delivered on {moment(order.deliveredAt).format('LLLL')}
                            </div>
                        ) : (
                            <div className="alert alert-danger">Not Delivered</div>
                        )}
                    </div>

                    <div className="order-section">
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method: </strong>
                            {order.paymentMethod}
                        </p>
                        {order.isPaid ? (
                            <div className="alert alert-success">
                                Paid on {moment(order.paidAt).format('LLLL')}
                            </div>
                        ) : (
                            <div className="alert alert-danger">Not Paid</div>
                        )}
                    </div>

                    <div className="order-section">
                        <h2>Order Items</h2>
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
                    <h2>Order Summary</h2>
                    <ul className="summary-list">
                        <li>
                            <span>Items</span>
                            <span>${order.itemsPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>Shipping</span>
                            <span>${order.shippingPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>Tax</span>
                            <span>${order.taxPrice.toFixed(2)}</span>
                        </li>
                        <li>
                            <span>Total</span>
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
