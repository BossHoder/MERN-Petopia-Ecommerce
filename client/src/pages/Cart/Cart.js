import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItemQuantity } from '../../store/actions/cartActions';
import Loader from '../../components/Loader/Loader';
import Message from '../../components/Message/Message';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import { useTranslation } from 'react-i18next';
import './Cart.css';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('cart');

    const { me: userInfo, appLoaded } = useSelector((state) => state.auth);
    const { items, loading, error } = useSelector((state) => state.cart);

    // Debug log
    console.log('userInfo in Cart:', userInfo, 'appLoaded:', appLoaded);

    useEffect(() => {
        if (appLoaded) {
            // Always load cart regardless of authentication status
            dispatch(getCart());
        }
    }, [dispatch, appLoaded]);

    const handleQuantityChange = (productId, quantity) => {
        if (quantity <= 0) {
            dispatch(removeFromCart(productId));
        } else {
            dispatch(updateCartItemQuantity(productId, quantity));
        }
    };

    const handleRemoveItem = (productId) => {
        dispatch(removeFromCart(productId));
    };

    const handleCheckout = () => {
        navigate('/checkout'); // Sẽ tạo trang này sau
    };

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    return (
        <div className="cart-container">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.cartNavigation', 'Cart navigation')}
            />

            <h1>{t('cart.title', 'Shopping Cart')}</h1>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message type="error">{error}</Message>
            ) : items.length === 0 ? (
                <div className="cart-empty">
                    <p>{t('cart.empty', 'Your cart is empty.')}</p>
                    <Link to="/" className="btn btn-primary">
                        {t('cart.goShopping', 'Go Shopping')}
                    </Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        {items.map((item) => (
                            <div key={item.product._id} className="cart-item">
                                <img
                                    src={item.product.image || '/images/placeholder.jpg'}
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <Link to={`/product/${item.product.slug || item.product._id}`}>
                                        {item.product.name}
                                    </Link>
                                    <p>
                                        {t('cart.price', 'Price')}: ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="cart-item-actions">
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.product._id,
                                                item.quantity - 1,
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.product._id,
                                                item.quantity + 1,
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="cart-item-total">
                                    <p>${(item.quantity * item.price).toFixed(2)}</p>
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemoveItem(item.product._id)}
                                    >
                                        {t('cart.remove', 'Remove')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>{t('cart.summaryTitle', 'Order Summary')}</h2>
                        <div className="summary-row">
                            <span>
                                {t('cart.subtotal', 'Subtotal')} (
                                {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                                {t('cart.items', 'items')})
                            </span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {/* Logic for shipping, tax, etc. can be added here */}
                        <div className="summary-total">
                            <span>{t('cart.total', 'Total')}</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                            {t('cart.checkout', 'Proceed to Checkout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
