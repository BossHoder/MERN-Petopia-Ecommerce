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
    SET_TOKEN_FROM_STORAGE,
} from '../types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    me: null,
    error: null,
    appLoaded: false,
};

export default function (state = initialState, { type, payload }) {
    switch (type) {
        case ME_LOADING:
            return {
                ...state,
                isLoading: true,
                appLoaded: false,
                error: null,
            };
        case LOGIN_WITH_EMAIL_LOADING:
        case LOGIN_WITH_OAUTH_LOADING:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case LOGIN_WITH_EMAIL_SUCCESS:
        case LOGIN_WITH_OAUTH_SUCCESS:
            localStorage.setItem('token', payload.token);
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                token: payload.token,
                me: payload.me,
                error: null,
                appLoaded: true, // 🔧 FIX: Set appLoaded to true after successful login
            };
        case ME_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                me: payload.me,
                error: null,
                appLoaded: true,
            };
        case ME_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                isAuthenticated: false,
                isLoading: false,
                me: null,
                error: null,
                appLoaded: true,
            };
        case LOGOUT_SUCCESS:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                me: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                appLoaded: true,
            };
        case LOGIN_WITH_EMAIL_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                me: null,
                isAuthenticated: false,
                isLoading: false,
                error: payload.error,
                appLoaded: true,
            };
        case LOGIN_WITH_OAUTH_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                me: null,
                isAuthenticated: false,
                isLoading: false,
                error: payload.error,
                appLoaded: true,
            };
        case SET_TOKEN_FROM_STORAGE:
            return {
                ...state,
                token: payload.token,
                isLoading: false,
                error: null,
            };
        default:
            return state;
    }
}
