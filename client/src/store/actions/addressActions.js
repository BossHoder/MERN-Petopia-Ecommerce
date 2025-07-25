import api from '../../services/api';
import * as types from '../types';
import { attachTokenToHeaders } from './authActions';

// Get user addresses
export const getAddresses = () => async (dispatch, getState) => {
    const {
        auth: { me },
    } = getState();

    // Do not proceed if user info is not available yet
    if (!me || !me.id) {
        // Optionally, dispatch a specific failure action or just return
        dispatch({
            type: types.GET_ADDRESSES_FAILURE,
            payload: 'User not authenticated. Cannot fetch addresses.',
        });
        return;
    }

    try {
        dispatch({ type: types.GET_ADDRESSES_LOADING });
        const userId = me.id;
        const options = attachTokenToHeaders(getState);

        const { data } = await api.get(`/api/users/${userId}/addresses`, options);

        dispatch({
            type: types.GET_ADDRESSES_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.GET_ADDRESSES_FAILURE,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Add a new address
export const addAddress = (addressData) => async (dispatch, getState) => {
    try {
        const {
            auth: { me },
        } = getState();
        const userId = me.id;
        const options = attachTokenToHeaders(getState);

        const { data } = await api.post(`/api/users/${userId}/addresses`, addressData, options);

        dispatch({
            type: types.ADD_ADDRESS_SUCCESS,
            payload: data.data, // Assuming the API returns the full updated list
        });
    } catch (error) {
        dispatch({
            type: types.ADD_ADDRESS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Update an existing address
export const updateAddress = (addressId, addressData) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.UPDATE_ADDRESS_REQUEST });
        const {
            auth: { me },
        } = getState();
        const userId = me.id;
        const options = attachTokenToHeaders(getState);

        const { data } = await api.put(
            `/api/users/${userId}/addresses/${addressId}`,
            addressData,
            options,
        );

        dispatch({
            type: types.UPDATE_ADDRESS_SUCCESS,
            payload: data.data, // API trả về danh sách địa chỉ đã cập nhật
        });
    } catch (error) {
        dispatch({
            type: types.UPDATE_ADDRESS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Delete an address
export const deleteAddress = (addressId) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.DELETE_ADDRESS_REQUEST });
        const {
            auth: { me },
        } = getState();
        const userId = me.id;
        const options = attachTokenToHeaders(getState);

        const { data } = await api.delete(`/api/users/${userId}/addresses/${addressId}`, options);

        dispatch({
            type: types.DELETE_ADDRESS_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.DELETE_ADDRESS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Set an address as default
export const setDefaultAddress = (addressId) => async (dispatch, getState) => {
    try {
        dispatch({ type: types.SET_DEFAULT_ADDRESS_REQUEST });
        const {
            auth: { me },
        } = getState();
        const userId = me.id;
        const options = attachTokenToHeaders(getState);

        const { data } = await api.put(
            `/api/users/${userId}/addresses/${addressId}/default`,
            {},
            options,
        );

        dispatch({
            type: types.SET_DEFAULT_ADDRESS_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.SET_DEFAULT_ADDRESS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};
