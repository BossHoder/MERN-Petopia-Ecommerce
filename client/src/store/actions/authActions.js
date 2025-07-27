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
    const tokenFromStorage = localStorage.getItem('token');

    console.log('🔍 loadMe() Debug:', {
        hasTokenInState: !!state.auth.token,
        hasTokenInStorage: !!tokenFromStorage,
        tokenPreview: tokenFromStorage ? `${tokenFromStorage.substring(0, 20)}...` : 'none',
    });

    // Check for malformed tokens
    if (
        tokenFromStorage &&
        (tokenFromStorage === 'undefined' ||
            tokenFromStorage === 'null' ||
            tokenFromStorage.length < 10)
    ) {
        console.log('🚨 Malformed token detected, clearing it:', tokenFromStorage);
        localStorage.removeItem('token');
        dispatch({
            type: ME_FAIL,
            payload: { error: 'auth.login.malformedToken' },
        });
        return;
    }

    // Nếu không có token trong localStorage hoặc Redux state, set appLoaded = true và không gọi API
    if (!state.auth.token && !tokenFromStorage) {
        console.log('✅ No token found - skipping API call');
        dispatch({
            type: ME_FAIL,
            payload: { error: 'auth.login.noTokenFound' },
        });
        return;
    }

    // Nếu có token trong localStorage nhưng không có trong Redux state, cập nhật Redux state
    if (tokenFromStorage && !state.auth.token) {
        dispatch({
            type: 'SET_TOKEN_FROM_STORAGE',
            payload: { token: tokenFromStorage },
        });
    }

    dispatch({ type: ME_LOADING });

    try {
        console.log('🌐 Making loadMe() API call...');
        const options = attachTokenToHeaders(getState);
        const response = await API.get('/api/users/me', options);

        dispatch({
            type: ME_SUCCESS,
            payload: { me: response.data.data?.me },
        });
    } catch (err) {
        console.log('❌ loadMe() API call failed:', err?.response?.status);

        // Nếu token không hợp lệ, xóa token và set appLoaded = true
        if (err?.response?.status === 401) {
            console.log('🧹 Invalid token detected - clearing auth state');
            localStorage.removeItem('token');

            // Clear authentication state
            dispatch({
                type: LOGOUT_SUCCESS,
            });
        }

        dispatch({
            type: ME_FAIL,
            payload: {
                error:
                    err?.response?.status === 401
                        ? 'auth.login.sessionExpired'
                        : 'auth.login.authenticationFailed',
                fallback: err?.response?.data?.message || err.message || 'Authentication failed',
            },
        });
    }
};

export const loginUserWithEmail = (formData, history) => async (dispatch, getState) => {
    dispatch({ type: LOGIN_WITH_EMAIL_LOADING });
    try {
        const response = await API.post('/auth/login', formData);

        // Extract token and user data from nested response structure
        const token = response.data.data?.token;
        const me = response.data.data?.me;

        console.log('🔍 Login response structure:', {
            hasData: !!response.data,
            hasNestedData: !!response.data.data,
            hasToken: !!token,
            hasMe: !!me,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
        });

        // Validate token before storing
        if (!token || token === 'undefined' || typeof token !== 'string') {
            throw new Error('auth.login.invalidToken');
        }

        console.log('✅ Login successful, storing token:', token.substring(0, 20) + '...');

        // Lưu token vào localStorage trước
        localStorage.setItem('token', token);

        dispatch({
            type: LOGIN_WITH_EMAIL_SUCCESS,
            payload: { token: token, me: me },
        });

        // Don't call loadMe() immediately - the login response already has user data
        // dispatch(loadMe()); // ⚠️ REMOVED: This was causing auth state issues

        // Migrate guest cart if exists
        const { migrateGuestCart } = await import('./cartActions');
        dispatch(migrateGuestCart());

        // Navigate với React Router v6
        dispatch({
            type: 'SHOW_TOAST',
            payload: { message: 'auth.login.success', type: 'success', useI18n: true },
        });
        history('/');
    } catch (err) {
        dispatch({
            type: LOGIN_WITH_EMAIL_FAIL,
            payload: { error: err?.response?.data?.message || err.message },
        });

        // Determine appropriate error message key
        let errorMessageKey = 'auth.login.failed';
        if (err?.response?.status === 401) {
            errorMessageKey = 'auth.login.invalidCredentials';
        } else if (err?.response?.status === 403) {
            errorMessageKey = 'auth.login.adminAccessDenied';
        }

        dispatch({
            type: 'SHOW_TOAST',
            payload: {
                message: errorMessageKey,
                type: 'error',
                useI18n: true,
                fallback: err?.response?.data?.message || err.message || 'Login failed!',
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

        // Extract user data from nested response structure
        const me = response.data.data?.me;

        console.log('🔍 OAuth login response:', {
            hasData: !!response.data,
            hasNestedData: !!response.data.data,
            hasMe: !!me,
        });

        dispatch({
            type: LOGIN_WITH_OAUTH_SUCCESS,
            payload: { me: me, token },
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
