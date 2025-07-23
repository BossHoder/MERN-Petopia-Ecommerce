import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartItemQuantity } from '../../store/actions/cartActions';
import Loader from '../../components/Loader/Loader';
import Message from '../../components/Message/Message';
import './Cart.css';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo } = useSelector((state) => state.auth);
    const { items, loading, error } = useSelector((state) => state.cart);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            dispatch(getCart());
        }
    }, [dispatch, navigate, userInfo]);

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
            <h1>Shopping Cart</h1>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message type="error">{error}</Message>
            ) : items.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="btn btn-primary">
                        Go Shopping
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
                                    <Link to={`/products/${item.product._id}`}>
                                        {item.product.name}
                                    </Link>
                                    <p>Price: ${item.price.toFixed(2)}</p>
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
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>
                                Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                                items)
                            </span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {/* Logic for shipping, tax, etc. can be added here */}
                        <div className="summary-total">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
