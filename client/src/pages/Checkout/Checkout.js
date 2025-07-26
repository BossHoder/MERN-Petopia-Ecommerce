import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder } from '../../store/actions/orderActions';
import { getAddresses, addAddress } from '../../store/actions/addressActions';
import {
    preserveCheckoutState,
    restoreCheckoutState,
    updateCheckoutStep,
    updatePaymentMethod,
    updateShippingAddress,
} from '../../store/actions/checkoutActions';
import { ORDER_CREATE_RESET } from '../../store/types';
import Loader from '../../components/Loader/Loader';
import Notification from '../../components/Notification/Notification';
import GuestCheckoutForm from '../../components/GuestCheckoutForm/GuestCheckoutForm';
import { useTranslation } from 'react-i18next';
import './Checkout.css';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation('common');

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        phoneNumber: '',
    });
    const [guestInfo, setGuestInfo] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    const { me: userInfo } = useSelector((state) => state.auth);
    const isAuthenticated = userInfo && userInfo.id;
    const { items: cartItems } = useSelector((state) => state.cart);
    const { addresses, loading: addressLoading } = useSelector((state) => state.address);
    const {
        order,
        success,
        error,
        loading: orderLoading,
    } = useSelector((state) => state.orderCreate);
    const {
        step: reduxStep,
        paymentMethod: reduxPaymentMethod,
        shippingAddress: reduxShippingAddress,
        isRestored,
    } = useSelector((state) => state.checkout);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Giả lập
    const taxPrice = 0.1 * itemsPrice; // Giả lập 10%
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    useEffect(() => {
        // Handle checkout business logic for both authenticated and guest users

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

        // Lấy danh sách địa chỉ đã lưu (chỉ cho authenticated users)
        if (isAuthenticated) {
            dispatch(getAddresses());
        }
    }, [navigate, dispatch, success, order, cartItems, orderLoading, isAuthenticated]);

    // Initialize state from Redux if available
    useEffect(() => {
        if (isRestored) {
            setStep(reduxStep);
            setPaymentMethod(reduxPaymentMethod);
            setShippingAddress(reduxShippingAddress);
        }
    }, [isRestored, reduxStep, reduxPaymentMethod, reduxShippingAddress]);

    // Handle returning from profile page with checkout context
    useEffect(() => {
        if (location.state?.fromProfile && location.state?.checkoutData) {
            // Restore checkout state from Redux
            dispatch(restoreCheckoutState());

            // Removed success toast - user can see their addresses are now available

            // Clear the navigation state to prevent re-triggering
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, location.pathname, dispatch, navigate, t]);

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleSelectSavedAddress = (addr) => {
        setShippingAddress(addr);
    };

    const handleGuestInfoSubmit = (guestData) => {
        setGuestInfo(guestData);
        setShippingAddress({
            address: guestData.address,
            phoneNumber: guestData.phoneNumber,
            city: guestData.city,
            fullName: guestData.fullName,
        });
        setStep(2);
        dispatch(updateCheckoutStep(2));
    };

    const submitAddressHandler = (e) => {
        e.preventDefault();

        // For authenticated users, validate that they have at least one saved address
        if (isAuthenticated && (!addresses || addresses.length === 0)) {
            // Preserve current checkout state in Redux
            dispatch(
                preserveCheckoutState({
                    step,
                    paymentMethod,
                    shippingAddress,
                }),
            );

            // Show error message using toast system
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    message: t(
                        'checkout.errors.noAddressFound',
                        'Please add a shipping address to continue with your order.',
                    ),
                    type: 'error',
                },
            });

            // Redirect to profile page with checkout context
            navigate('/profile', {
                state: {
                    fromCheckout: true,
                    focusTab: 'addresses',
                    checkoutData: {
                        cartItems,
                        paymentMethod,
                        step: 1,
                    },
                },
            });
            return;
        }

        // For authenticated users, validate that a shipping address is selected
        if (isAuthenticated && (!shippingAddress.address || !shippingAddress.phoneNumber)) {
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    message: t(
                        'checkout.errors.selectAddress',
                        'Please select a shipping address to continue.',
                    ),
                    type: 'error',
                },
            });
            return;
        }

        // For guest users, the address validation is handled in the guest form
        setStep(2);
        dispatch(updateCheckoutStep(2));
    };

    const submitPaymentHandler = (e) => {
        e.preventDefault();
        setStep(3);
        dispatch(updateCheckoutStep(3));
    };

    const placeOrderHandler = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty. Cannot place order.');
            return;
        }
        const orderData = {
            orderItems: cartItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        };

        // Add guest info if user is not authenticated
        if (!isAuthenticated) {
            orderData.guestInfo = guestInfo;
        }

        dispatch(createOrder(orderData));
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

                            {!isAuthenticated ? (
                                // Guest checkout form
                                <GuestCheckoutForm
                                    onSubmit={handleGuestInfoSubmit}
                                    initialData={guestInfo}
                                />
                            ) : (
                                // Authenticated user address selection
                                <>
                                    {addressLoading && <Loader />}
                                    {addresses && addresses.length > 0 ? (
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
                                                    <div>
                                                        <span>Địa chỉ: </span>
                                                        {addr.address}
                                                    </div>
                                                    <div>
                                                        <span>Số điện thoại: </span>
                                                        {addr.phoneNumber}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        !addressLoading && (
                                            <div className="no-addresses-message">
                                                <span className="icon">📍</span>
                                                <div className="message">
                                                    {t(
                                                        'checkout.noAddresses.title',
                                                        'No shipping addresses found',
                                                    )}
                                                </div>
                                                <div className="sub-message">
                                                    {t(
                                                        'checkout.noAddresses.description',
                                                        'You need to add a shipping address before you can complete your order.',
                                                    )}
                                                </div>
                                            </div>
                                        )
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
                                                readOnly
                                            />
                                            <label>{t('checkout.phone', 'Phone')}</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={shippingAddress.phoneNumber}
                                                onChange={handleAddressChange}
                                                required
                                                readOnly
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            {t('checkout.continue', 'Continue')}
                                        </button>
                                    </form>
                                </>
                            )}
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
                            <p>{t('checkout.confirmMessage', 'Confirm your order')}</p>
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
