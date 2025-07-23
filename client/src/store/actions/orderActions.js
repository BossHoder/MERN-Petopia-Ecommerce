import api from '../../services/api';
import * as types from '../types';
import { clearCart } from './cartActions';

export const createOrder = (order) => async (dispatch, getState) => {
    try {
        dispatch({
            type: types.ORDER_CREATE_REQUEST,
        });

        const { data } = await api.post('/api/orders', order);

        dispatch({
            type: types.ORDER_CREATE_SUCCESS,
            payload: data.data,
        });

        // Clear the cart after successful order creation
        dispatch(clearCart());
    } catch (error) {
        dispatch({
            type: types.ORDER_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getOrderDetails = (id) => async (dispatch, getState) => {
    try {
        dispatch({
            type: types.ORDER_DETAILS_REQUEST,
        });

        const { data } = await api.get(`/api/orders/${id}`);

        dispatch({
            type: types.ORDER_DETAILS_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.ORDER_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const payOrder = (orderId, paymentResult) => async (dispatch, getState) => {
    try {
        dispatch({
            type: types.ORDER_PAY_REQUEST,
        });

        const { data } = await api.put(`/api/orders/${orderId}/pay`, paymentResult);

        dispatch({
            type: types.ORDER_PAY_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.ORDER_PAY_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const listMyOrders = () => async (dispatch, getState) => {
    try {
        dispatch({
            type: types.ORDER_LIST_MY_REQUEST,
        });

        const { data } = await api.get('/api/orders/myorders');

        dispatch({
            type: types.ORDER_LIST_MY_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.ORDER_LIST_MY_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};
