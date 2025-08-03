import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItemQuantity } from '../../store/actions/cartActions';
import Loader from '../../components/Loader/Loader';
import Message from '../../components/Message/Message';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/displayUtils';
import analytics from '../../utils/analytics';
import './Cart.css';
import { toast } from 'react-toastify';

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

    const handleQuantityChange = (productId, quantity, variantId = null) => {
        if (quantity <= 0) {
            dispatch(removeFromCart(productId, variantId));
        } else {
            dispatch(updateCartItemQuantity(productId, quantity, variantId));
        }
    };

    const handleRemoveItem = (productId, variantId = null) => {
        const item = items.find(
            (item) =>
                item.product._id === productId && (item.variantId || null) === (variantId || null),
        );

        if (item) {
            // Track remove from cart event
            analytics.trackRemoveFromCart({
                _id: productId,
                name: item.product.name,
                price: item.price,
                category: item.product.category,
                brand: item.product.brand,
                sku: item.product.sku,
                quantity: item.quantity,
                variantId: variantId,
                variantDisplayName: item.variant?.displayName,
            });
        }

        dispatch(removeFromCart(productId, variantId));
    };

    const handleCheckout = () => {
        const invalidItems = items.filter((item) => item.quantity > item.product.countInStock);
        if (invalidItems.length > 0) {
            toast.error(t('cart.quantityError'));
            return;
        }

        // Track begin checkout event
        analytics.trackBeginCheckout({
            items: items.map((item) => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.price,
                category: item.product.category,
                brand: item.product.brand,
                sku: item.product.sku,
                quantity: item.quantity,
                variantId: item.variantId,
                variantDisplayName: item.variant?.displayName,
            })),
            value: subtotal,
            currency: 'VND',
        });

        navigate('/checkout');
    };

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    return (
        <div className="cart-container">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.cartNavigation')}
            />

            <h1>{t('cart.title')}</h1>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message type="error">{error}</Message>
            ) : items.length === 0 ? (
                <div className="cart-empty">
                    <p>{t('cart.empty')}</p>
                    <Link to="/" className="btn btn-primary">
                        {t('cart.goShopping')}
                    </Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        {items.map((item) => {
                            // Create a unique key that includes variant information
                            const itemKey = item.variantId
                                ? `${item.product._id}-${item.variantId}`
                                : item.product._id;

                            return (
                                <div key={itemKey} className="cart-item">
                                    <img
                                        src={item.product.image || '/images/placeholder.jpg'}
                                        alt={item.product.name}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-details">
                                        <Link
                                            to={`/product/${item.product.slug || item.product._id}`}
                                        >
                                            {item.product.name}
                                        </Link>
                                        {/* Display variant information if available */}
                                        {(item.variant || item.variantId) && (
                                            <div className="cart-item-variant">
                                                {item.variant?.displayName ||
                                                    (item.variant
                                                        ? `${item.variant.name}: ${item.variant.value}`
                                                        : `Variant: ${item.variantId}`)}
                                            </div>
                                        )}
                                        <p>
                                            {t('cart.price')}: {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item.product._id,
                                                    item.quantity - 1,
                                                    item.variantId,
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
                                                    item.variantId,
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="cart-item-total">
                                        <p>{formatPrice(item.quantity * item.price)}</p>
                                        <button
                                            className="remove-btn"
                                            onClick={() =>
                                                handleRemoveItem(item.product._id, item.variantId)
                                            }
                                        >
                                            {t('cart.remove')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <h2>{t('cart.summaryTitle')}</h2>
                        <div className="summary-row">
                            <span>
                                {t('cart.subtotal')} (
                                {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                                {t('cart.items')})
                            </span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {/* Logic for shipping, tax, etc. can be added here */}
                        <div className="summary-total">
                            <span>{t('cart.total')}</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                            {t('cart.checkout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
