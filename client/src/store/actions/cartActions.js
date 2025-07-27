import api from '../../services/api';
import * as types from '../types';
import {
    getGuestCart,
    addItemToGuestCart,
    removeItemFromGuestCart,
    updateGuestCartItemQuantity,
    clearGuestCart,
    getGuestCartForMigration,
    clearGuestCartAfterMigration,
} from '../../utils/guestCartStorage';

// Get cart from server or localStorage
export const getCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { auth } = getState();
        const isAuthenticated = auth.me && auth.token;

        if (isAuthenticated) {
            // Get cart from server for authenticated users
            const { data } = await api.get('/api/cart');
            dispatch({
                type: types.CART_GET_SUCCESS,
                payload: data.data,
            });
        } else {
            // Get cart from localStorage for guest users
            const guestCart = getGuestCart();
            dispatch({
                type: types.CART_GET_SUCCESS,
                payload: guestCart,
            });
        }
    } catch (error) {
        // If server request fails for authenticated user, fall back to guest cart
        const guestCart = getGuestCart();
        dispatch({
            type: types.CART_GET_SUCCESS,
            payload: guestCart,
        });
    }
};

// Add item to cart (supports both authenticated and guest users)
export const addToCart =
    (productId, quantity, productData = null) =>
    async (dispatch, getState) => {
        return new Promise(async (resolve, reject) => {
            try {
                dispatch({ type: types.CART_LOADING });

                const { auth } = getState();
                const isAuthenticated = auth.me && auth.token;

                if (isAuthenticated) {
                    // Add to server cart for authenticated users
                    console.log('🛒 Adding to cart:', { productId, quantity });
                    const { data } = await api.post('/api/cart', { productId, quantity });
                    dispatch({
                        type: types.ADD_TO_CART_SUCCESS,
                        payload: data.data,
                    });
                } else {
                    // Add to guest cart in localStorage
                    if (!productData) {
                        // Fetch product data if not provided
                        const productResponse = await api.get(`/api/products/${productId}`);
                        productData = productResponse.data.data;
                    }

                    const updatedCart = addItemToGuestCart(productData, quantity);
                    dispatch({
                        type: types.ADD_TO_CART_SUCCESS,
                        payload: updatedCart,
                    });
                }

                resolve();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                dispatch({
                    type: types.ADD_TO_CART_FAIL,
                    payload: errorMessage,
                });
                reject(errorMessage);
            }
        });
    };

// Remove item from cart (supports both authenticated and guest users)
export const removeFromCart = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { auth } = getState();
        const isAuthenticated = auth.me && auth.token;

        if (isAuthenticated) {
            // Remove from server cart for authenticated users
            const { data } = await api.delete(`/api/cart/items/${productId}`);
            dispatch({
                type: types.REMOVE_FROM_CART_SUCCESS,
                payload: data.data,
            });
        } else {
            // Remove from guest cart in localStorage
            const updatedCart = removeItemFromGuestCart(productId);
            dispatch({
                type: types.REMOVE_FROM_CART_SUCCESS,
                payload: updatedCart,
            });
        }
    } catch (error) {
        dispatch({
            type: types.REMOVE_FROM_CART_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Update item quantity (supports both authenticated and guest users)
export const updateCartItemQuantity = (productId, quantity) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { auth } = getState();
        const isAuthenticated = auth.me && auth.token;

        if (isAuthenticated) {
            // Update server cart for authenticated users
            const { data } = await api.put(`/api/cart/items/${productId}`, { quantity });
            dispatch({
                type: types.UPDATE_CART_ITEM_SUCCESS,
                payload: data.data,
            });
        } else {
            // Update guest cart in localStorage
            const updatedCart = updateGuestCartItemQuantity(productId, quantity);
            dispatch({
                type: types.UPDATE_CART_ITEM_SUCCESS,
                payload: updatedCart,
            });
        }
    } catch (error) {
        dispatch({
            type: types.UPDATE_CART_ITEM_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Clear entire cart (supports both authenticated and guest users)
export const clearCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { auth } = getState();
        const isAuthenticated = auth.me && auth.token;

        if (isAuthenticated) {
            // Clear server cart for authenticated users
            const { data } = await api.delete('/api/cart');
            dispatch({
                type: types.CLEAR_CART_SUCCESS,
                payload: data.data,
            });
        } else {
            // Clear guest cart in localStorage
            const clearedCart = clearGuestCart();
            dispatch({
                type: types.CLEAR_CART_SUCCESS,
                payload: clearedCart,
            });
        }
    } catch (error) {
        dispatch({
            type: types.CLEAR_CART_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Migrate guest cart to authenticated user cart
export const migrateGuestCart = () => async (dispatch, getState) => {
    try {
        const { auth } = getState();
        const isAuthenticated = auth.me && auth.token;

        if (!isAuthenticated) {
            return; // Only migrate if user is authenticated
        }

        const guestCartData = getGuestCartForMigration();
        if (!guestCartData || guestCartData.items.length === 0) {
            return; // No guest cart to migrate
        }

        // Send guest cart items to server for migration
        await api.post('/api/cart/migrate', guestCartData);

        // Clear guest cart after successful migration
        clearGuestCartAfterMigration();

        // Refresh cart from server
        dispatch(getCart());

        dispatch({
            type: 'SHOW_TOAST',
            payload: { message: 'Giỏ hàng đã được đồng bộ!', type: 'success' },
        });
    } catch (error) {
        console.error('Error migrating guest cart:', error);
        // Don't show error to user, just log it
    }
};
