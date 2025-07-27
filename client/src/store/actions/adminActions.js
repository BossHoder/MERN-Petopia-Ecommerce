import API from '../../services/api';
import {
    ADMIN_DASHBOARD_STATS_REQUEST,
    ADMIN_DASHBOARD_STATS_SUCCESS,
    ADMIN_DASHBOARD_STATS_FAIL,
    ADMIN_ORDERS_REQUEST,
    ADMIN_ORDERS_SUCCESS,
    ADMIN_ORDERS_FAIL,
    ADMIN_ORDER_UPDATE_REQUEST,
    ADMIN_ORDER_UPDATE_SUCCESS,
    ADMIN_ORDER_UPDATE_FAIL,
    ADMIN_USERS_REQUEST,
    ADMIN_USERS_SUCCESS,
    ADMIN_USERS_FAIL,
    ADMIN_CLEAR_ERRORS
} from '../types';

// ===========================================
// DASHBOARD ACTIONS
// ===========================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_DASHBOARD_STATS_REQUEST });

        const response = await API.get('/api/admin/dashboard/stats');

        dispatch({
            type: ADMIN_DASHBOARD_STATS_SUCCESS,
            payload: response.data.data
        });
    } catch (error) {
        dispatch({
            type: ADMIN_DASHBOARD_STATS_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to fetch dashboard stats'
        });
    }
};

// ===========================================
// ORDERS MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all orders for admin
 */
export const getAdminOrders = (page = 1, limit = 10, status = 'all', search = '') => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_ORDERS_REQUEST });

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status !== 'all' && { status }),
            ...(search && { search })
        });

        const response = await API.get(`/api/admin/orders?${queryParams}`);

        dispatch({
            type: ADMIN_ORDERS_SUCCESS,
            payload: response.data.data
        });
    } catch (error) {
        dispatch({
            type: ADMIN_ORDERS_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to fetch orders'
        });
    }
};

/**
 * Update order status
 */
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_ORDER_UPDATE_REQUEST });

        const response = await API.put(`/api/admin/orders/${orderId}/status`, { status });

        dispatch({
            type: ADMIN_ORDER_UPDATE_SUCCESS,
            payload: response.data.data
        });

        // Refresh orders list after update
        dispatch(getAdminOrders());
    } catch (error) {
        dispatch({
            type: ADMIN_ORDER_UPDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to update order status'
        });
    }
};

// ===========================================
// USERS MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all users for admin
 */
export const getAdminUsers = (page = 1, limit = 10, search = '') => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_USERS_REQUEST });

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });

        const response = await API.get(`/api/admin/users?${queryParams}`);

        dispatch({
            type: ADMIN_USERS_SUCCESS,
            payload: response.data.data
        });
    } catch (error) {
        dispatch({
            type: ADMIN_USERS_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to fetch users'
        });
    }
};

// ===========================================
// UTILITY ACTIONS
// ===========================================

/**
 * Clear admin errors
 */
export const clearAdminErrors = () => (dispatch) => {
    dispatch({ type: ADMIN_CLEAR_ERRORS });
};
