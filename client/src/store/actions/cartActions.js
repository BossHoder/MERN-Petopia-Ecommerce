import api from '../../services/api';
import * as types from '../types';

// Get cart from server
export const getCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { data } = await api.get('/api/cart');

        dispatch({
            type: types.CART_GET_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.CART_GET_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Add item to cart
export const addToCart = (productId, quantity) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { data } = await api.post('/api/cart', { productId, quantity });

        dispatch({
            type: types.ADD_TO_CART_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.ADD_TO_CART_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Remove item from cart
export const removeFromCart = (productId) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { data } = await api.delete(`/api/cart/items/${productId}`);

        dispatch({
            type: types.REMOVE_FROM_CART_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.REMOVE_FROM_CART_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Update item quantity
export const updateCartItemQuantity = (productId, quantity) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { data } = await api.put(`/api/cart/items/${productId}`, { quantity });

        dispatch({
            type: types.UPDATE_CART_ITEM_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.UPDATE_CART_ITEM_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Clear entire cart
export const clearCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: types.CART_LOADING });

        const { data } = await api.delete('/api/cart');

        dispatch({
            type: types.CLEAR_CART_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.CLEAR_CART_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};
