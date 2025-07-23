import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../store/actions/orderActions';
import { getAddresses, addAddress } from '../../store/actions/addressActions';
import { ORDER_CREATE_RESET } from '../../store/types';
import Loader from '../../components/Loader/Loader';
import Notification from '../../components/Notification/Notification'; // Sửa import
import { useTranslation } from 'react-i18next';
import './Checkout.css';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'Vietnam',
    });

    const { me: userInfo } = useSelector((state) => state.auth); // Sửa cho nhất quán
    const { items: cartItems } = useSelector((state) => state.cart);
    const { addresses, loading: addressLoading } = useSelector((state) => state.address); // Sửa từ addresses thành address
    const {
        order,
        success,
        error,
        loading: orderLoading,
    } = useSelector((state) => state.orderCreate);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Giả lập
    const taxPrice = 0.1 * itemsPrice; // Giả lập 10%
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    useEffect(() => {
        // Nếu không có thông tin user, chuyển đến trang đăng nhập
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
            return;
        }

        // Nếu tạo đơn hàng thành công, reset state và chuyển đến trang chi tiết đơn hàng
        if (success) {
            dispatch({ type: ORDER_CREATE_RESET });
            navigate(`/order/${order._id}`);
            return;
        }

        // Nếu giỏ hàng rỗng, không cho ở lại trang checkout, chuyển về trang chủ
        if (cartItems.length === 0 && !orderLoading) {
            navigate('/');
            return;
        }

        // Lấy danh sách địa chỉ đã lưu
        dispatch(getAddresses());
    }, [navigate, userInfo, dispatch, success, order, cartItems, orderLoading]);

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleSelectSavedAddress = (addr) => {
        setShippingAddress(addr);
    };

    const submitAddressHandler = (e) => {
        e.preventDefault();
        // Có thể thêm action `addAddress` ở đây nếu muốn lưu địa chỉ mới
        setStep(2);
    };

    const submitPaymentHandler = (e) => {
        e.preventDefault();
        setStep(3);
    };

    const placeOrderHandler = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty. Cannot place order.');
            return;
        }
        dispatch(
            createOrder({
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            }),
        );
    };

    return (
        <div className="checkout-container">
            <h1>{t('checkout.title', 'Checkout')}</h1>
            {orderLoading && <Loader />}
            {error && <Notification type="error">{error}</Notification>} {/* Sửa component */}
            <div className="checkout-steps">
                <div className={step >= 1 ? 'step active' : 'step'}>
                    {t('checkout.steps.shipping', 'Shipping')}
                </div>
                <div className={step >= 2 ? 'step active' : 'step'}>
                    {t('checkout.steps.payment', 'Payment')}
                </div>
                <div className={step >= 3 ? 'step active' : 'step'}>
                    {t('checkout.steps.placeOrder', 'Place Order')}
                </div>
            </div>
            <div className="checkout-content">
                <div className="checkout-form">
                    {step === 1 && (
                        <div>
                            <h2>{t('checkout.shippingAddress', 'Shipping Address')}</h2>
                            {addressLoading && <Loader />}
                            {addresses && addresses.length > 0 && (
                                <div className="saved-addresses">
                                    <h3>
                                        {t(
                                            'checkout.selectSavedAddress',
                                            'Select a saved address:',
                                        )}
                                    </h3>
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className="saved-address"
                                            onClick={() => handleSelectSavedAddress(addr)}
                                        >
                                            {addr.address}, {addr.city}, {addr.postalCode}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={submitAddressHandler}>
                                <div className="form-group">
                                    <label>{t('checkout.address', 'Address')}</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={shippingAddress.address}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('checkout.city', 'City')}</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('checkout.postalCode', 'Postal Code')}</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={shippingAddress.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    {t('checkout.continue', 'Continue')}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2>{t('checkout.paymentMethod', 'Payment Method')}</h2>
                            <form onSubmit={submitPaymentHandler}>
                                <div className="form-group">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label htmlFor="cod">
                                        {t('checkout.cod', 'Cash on Delivery (COD)')}
                                    </label>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="radio"
                                        id="paypal"
                                        name="paymentMethod"
                                        value="PayPal"
                                        checked={paymentMethod === 'PayPal'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label htmlFor="paypal">
                                        {t('checkout.paypal', 'PayPal or Credit Card')}
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    {t('checkout.continue', 'Continue')}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2>{t('checkout.confirmOrder', 'Confirm Order')}</h2>
                            <p>
                                {t(
                                    'checkout.confirmMessage',
                                    'You are about to place the following order. Please review and confirm.',
                                )}
                            </p>
                            <button
                                onClick={placeOrderHandler}
                                className="btn btn-primary btn-block"
                            >
                                {t('checkout.steps.placeOrder', 'Place Order')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="checkout-summary">
                    <h2>{t('cart.summaryTitle', 'Order Summary')}</h2>
                    <div className="summary-row">
                        <span>{t('checkout.summary.items', 'Items')}:</span>
                        <span>${itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('checkout.summary.shipping', 'Shipping')}:</span>
                        <span>${shippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('checkout.summary.tax', 'Tax')}:</span>
                        <span>${taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-total">
                        <span>{t('cart.total', 'Total')}:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
