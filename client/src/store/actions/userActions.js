import API from '../../services/api';

import { attachTokenToHeaders } from './authActions';
import {
    GET_PROFILE_LOADING,
    GET_PROFILE_SUCCESS,
    GET_PROFILE_FAIL,
    EDIT_USER_LOADING,
    EDIT_USER_SUCCESS,
    EDIT_USER_FAIL,
    DELETE_USER_LOADING,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAIL,
} from '../types';

import { logOutUser, loadMe } from './authActions';

export const editUser = (id, formData, navigate) => async (dispatch, getState) => {
    dispatch({
        type: EDIT_USER_LOADING,
    });
    try {
        const options = attachTokenToHeaders(getState);

        // For FormData, we need to set the Content-Type to multipart/form-data
        // and remove the default Content-Type header to let browser set it automatically
        if (formData instanceof FormData) {
            options.headers = {
                ...options.headers,
            };
            // Remove Content-Type to let browser set multipart/form-data with boundary
            delete options.headers['Content-Type'];

            // Set timeout for file uploads
            options.timeout = 60000; // 60 seconds for file uploads
        }

        console.log('Sending editUser request:', { id, formData, options });
        const response = await API.put(`/api/users/${id}`, formData, options);
        console.log('editUser response:', response.data);

        dispatch({
            type: EDIT_USER_SUCCESS,
            payload: { user: response.data.user },
        });

        // Show success message
        console.log('Profile updated successfully!');

        // edited him self, reload me
        if (getState().auth.me?.id === response.data.user.id) dispatch(loadMe());

        // Only redirect if username changed
        if (getState().auth.me?.username !== response.data.user.username) {
            navigate(`/${response.data.user.username}`);
        }
    } catch (err) {
        console.error('editUser error:', err);
        console.error('Error response:', err?.response?.data);

        let errorMessage = 'Network error occurred';

        if (err.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.message) {
            errorMessage = err.message;
        }

        dispatch({
            type: EDIT_USER_FAIL,
            payload: {
                error: errorMessage,
            },
        });
    }
};

export const getProfile = (username, navigate) => async (dispatch, getState) => {
    dispatch({
        type: GET_PROFILE_LOADING,
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.get(`/api/users/${username}`, options);

        dispatch({
            type: GET_PROFILE_SUCCESS,
            payload: { profile: response.data.user },
        });
    } catch (err) {
        if (err?.response?.status === 404) {
            navigate('/notfound');
        }
        dispatch({
            type: GET_PROFILE_FAIL,
            payload: { error: err?.response?.data?.message || err.message },
        });
    }
};

export const deleteUser = (id, navigate) => async (dispatch, getState) => {
    dispatch({
        type: DELETE_USER_LOADING,
        payload: { id },
    });
    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.delete(`/api/users/${id}`, options);

        //logout only if he deleted himself
        if (getState().auth.me.id === response.data.user.id) {
            dispatch(logOutUser(id, navigate));
        }
        navigate('/users');
        dispatch({
            type: DELETE_USER_SUCCESS,
            payload: { message: response.data.user },
        });
    } catch (err) {
        dispatch({
            type: DELETE_USER_FAIL,
            payload: { error: err?.response?.data.message || err.message },
        });
    }
};
