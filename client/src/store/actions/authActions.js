import API from '../../services/api';

import { getMessages } from './messageActions';
import {
    LOGIN_WITH_OAUTH_LOADING,
    LOGIN_WITH_OAUTH_SUCCESS,
    LOGIN_WITH_OAUTH_FAIL,
    LOGOUT_SUCCESS,
    LOGIN_WITH_EMAIL_LOADING,
    LOGIN_WITH_EMAIL_SUCCESS,
    LOGIN_WITH_EMAIL_FAIL,
    ME_LOADING,
    ME_SUCCESS,
    ME_FAIL,
    RESEED_DATABASE_LOADING,
    RESEED_DATABASE_SUCCESS,
    RESEED_DATABASE_FAIL,
} from '../types';
// import { toast } from 'react-toastify';

// Toast helper (simple, có thể thay bằng Notification component toàn cục nếu có)
const showToast = (msg, type = 'success') => {
    if (window && window.alert) {
        window.alert(msg); // Thay bằng hệ thống toast thực tế nếu có
    }
};

export const loadMe = () => async (dispatch, getState) => {
    const state = getState();

    // Nếu không có token, set appLoaded = true và không gọi API
    if (!state.auth.token) {
        dispatch({
            type: ME_FAIL,
            payload: { error: 'No token found' },
        });
        return;
    }

    dispatch({ type: ME_LOADING });

    try {
        const options = attachTokenToHeaders(getState);
        const response = await API.get('/api/users/me', options);

        dispatch({
            type: ME_SUCCESS,
            payload: { me: response.data.data?.me },
        });
    } catch (err) {
        // Nếu token không hợp lệ, xóa token và set appLoaded = true
        if (err?.response?.status === 401) {
            localStorage.removeItem('token');

            // Clear authentication state
            dispatch({
                type: LOGOUT_SUCCESS,
            });
        }

        dispatch({
            type: ME_FAIL,
            payload: {
                error: err?.response?.data?.message || err.message || 'Authentication failed',
            },
        });
    }
};

export const loginUserWithEmail = (formData, history) => async (dispatch, getState) => {
    dispatch({ type: LOGIN_WITH_EMAIL_LOADING });
    try {
        const response = await API.post('/auth/login', formData);

        dispatch({
            type: LOGIN_WITH_EMAIL_SUCCESS,
            payload: { token: response.data.token, me: response.data.me },
        });

        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.token);

        // Load user data sau khi login thành công
        dispatch(loadMe());

        // Migrate guest cart if exists
        const { migrateGuestCart } = await import('./cartActions');
        dispatch(migrateGuestCart());

        // Navigate với React Router v6
        dispatch({
            type: 'SHOW_TOAST',
            payload: { message: 'Đăng nhập thành công!', type: 'success' },
        });
        history('/');
    } catch (err) {
        dispatch({
            type: LOGIN_WITH_EMAIL_FAIL,
            payload: { error: err?.response?.data?.message || err.message },
        });
        dispatch({
            type: 'SHOW_TOAST',
            payload: {
                message: err?.response?.data?.message || err.message || 'Đăng nhập thất bại!',
                type: 'error',
            },
        });
    }
};

export const logInUserWithOauth = (token) => async (dispatch, getState) => {
    dispatch({ type: LOGIN_WITH_OAUTH_LOADING });

    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-auth-token': token,
        };

        const response = await API.get('/api/users/me', { headers });

        dispatch({
            type: LOGIN_WITH_OAUTH_SUCCESS,
            payload: { me: response.data.me, token },
        });
    } catch (err) {
        dispatch({
            type: LOGIN_WITH_OAUTH_FAIL,
            payload: { error: err?.response?.data?.message || err.message },
        });
    }
};

// Log user out
export const logOutUser = (navigate) => async (dispatch) => {
    try {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');

        // Xóa cookie (nếu có)
        deleteAllCookies();

        // Dispatch logout success trước khi gọi API
        dispatch({
            type: LOGOUT_SUCCESS,
        });

        // Gọi API để server ghi nhận logout (không chờ response)
        API.get('/auth/logout').catch((err) => {
            console.warn('Logout API call failed:', err);
        });

        // Sử dụng React Router navigate thay vì window.location
        if (navigate) {
            navigate('/login', { replace: true });
        } else {
            // Fallback: use history API instead of window.location to avoid full reload
            window.history.pushState(null, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }

        // Show success message
        dispatch({
            type: 'SHOW_TOAST',
            payload: { message: 'Đăng xuất thành công!', type: 'success' },
        });
    } catch (err) {
        console.error('Logout failed:', err);

        // Vẫn dispatch logout success để clear state
        dispatch({
            type: LOGOUT_SUCCESS,
        });

        // Vẫn chuyển hướng ngay cả khi có lỗi
        if (navigate) {
            navigate('/login', { replace: true });
        } else {
            // Fallback: use history API instead of window.location to avoid full reload
            window.history.pushState(null, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }
};

export const reseedDatabase = () => async (dispatch, getState) => {
    dispatch({
        type: RESEED_DATABASE_LOADING,
    });
    try {
        await API.get('/api/users/reseed');

        dispatch({
            type: RESEED_DATABASE_SUCCESS,
        });
        dispatch(logOutUser());
        dispatch(getMessages());
    } catch (err) {
        dispatch({
            type: RESEED_DATABASE_FAIL,
            payload: { error: err?.response?.data.message || err.message },
        });
    }
};

function deleteAllCookies() {
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf('=');
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
}

export const attachTokenToHeaders = (getState) => {
    const token = getState().auth.token;

    const config = {
        headers: {
            'Content-type': 'application/json',
        },
    };

    if (token) {
        config.headers['x-auth-token'] = token;
    }

    return config;
};
