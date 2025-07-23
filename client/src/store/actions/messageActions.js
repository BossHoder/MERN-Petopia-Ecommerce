import API from '../../services/api';
import { attachTokenToHeaders } from './authActions';
import {
    GET_MESSAGES_LOADING,
    GET_MESSAGES_SUCCESS,
    GET_MESSAGES_FAIL,
    ADD_MESSAGE_LOADING,
    ADD_MESSAGE_SUCCESS,
    ADD_MESSAGE_FAIL,
    DELETE_MESSAGE_LOADING,
    DELETE_MESSAGE_SUCCESS,
    DELETE_MESSAGE_FAIL,
    EDIT_MESSAGE_LOADING,
    EDIT_MESSAGE_SUCCESS,
    EDIT_MESSAGE_FAIL,
    CLEAR_MESSAGE_ERROR,
} from '../types';
import errorCodeMap from '../../constants/errorCodeMap';
import i18n from '../../i18n/i18n';

const mapErrorToMessage = (error) => {
    // Ưu tiên code lỗi backend, nếu không có thì dùng message
    const code = error?.response?.data?.code || error?.code;
    const backendMsg = error?.response?.data?.message;
    if (code && errorCodeMap[code]) {
        return i18n.t(errorCodeMap[code]);
    }
    if (backendMsg && errorCodeMap[backendMsg]) {
        return i18n.t(errorCodeMap[backendMsg]);
    }
    // fallback: dùng message backend hoặc message mặc định
    return backendMsg || error.message || i18n.t('errors.internal');
};

export const getMessages = () => async (dispatch, getState) => {
    dispatch({
        type: GET_MESSAGES_LOADING,
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.get('/api/messages', options);
        dispatch({
            type: GET_MESSAGES_SUCCESS,
            payload: { messages: response.data.messages },
        });
    } catch (err) {
        dispatch({
            type: GET_MESSAGES_FAIL,
            payload: { error: mapErrorToMessage(err) },
        });
    }
};

export const addMessage = (formData) => async (dispatch, getState) => {
    dispatch({
        type: ADD_MESSAGE_LOADING,
        payload: { me: { ...getState().auth.me } },
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.post('/api/messages', formData, options);
        dispatch({
            type: ADD_MESSAGE_SUCCESS,
            payload: { message: response.data.message },
        });
    } catch (err) {
        dispatch({
            type: ADD_MESSAGE_FAIL,
            payload: { error: mapErrorToMessage(err) },
        });
    }
};

export const deleteMessage = (id) => async (dispatch, getState) => {
    dispatch({
        type: DELETE_MESSAGE_LOADING,
        payload: { id },
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.delete(`/api/messages/${id}`, options);
        dispatch({
            type: DELETE_MESSAGE_SUCCESS,
            payload: { message: response.data.message },
        });
    } catch (err) {
        dispatch({
            type: DELETE_MESSAGE_FAIL,
            payload: { error: mapErrorToMessage(err) },
        });
    }
};

export const editMessage = (id, formData) => async (dispatch, getState) => {
    dispatch({
        type: EDIT_MESSAGE_LOADING,
        payload: { id },
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.put(`/api/messages/${id}`, formData, options);
        dispatch({
            type: EDIT_MESSAGE_SUCCESS,
            payload: { message: response.data.message },
        });
    } catch (err) {
        dispatch({
            type: EDIT_MESSAGE_FAIL,
            payload: { error: mapErrorToMessage(err), id },
        });
    }
};

export const clearMessageError = (id) => ({
    type: CLEAR_MESSAGE_ERROR,
    payload: { id },
});
