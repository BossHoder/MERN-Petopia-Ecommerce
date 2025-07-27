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

const initialState = {
    // Dashboard
    dashboardStats: {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        growth: {
            users: 0,
            orders: 0,
            revenue: 0
        }
    },
    dashboardLoading: false,

    // Orders Management
    orders: [],
    ordersPagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    },
    ordersLoading: false,
    orderUpdateLoading: false,

    // Users Management
    users: [],
    usersPagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
    },
    usersLoading: false,

    // Error handling
    error: null,
    success: null
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===========================================
        // DASHBOARD CASES
        // ===========================================
        case ADMIN_DASHBOARD_STATS_REQUEST:
            return {
                ...state,
                dashboardLoading: true,
                error: null
            };

        case ADMIN_DASHBOARD_STATS_SUCCESS:
            return {
                ...state,
                dashboardLoading: false,
                dashboardStats: action.payload,
                error: null
            };

        case ADMIN_DASHBOARD_STATS_FAIL:
            return {
                ...state,
                dashboardLoading: false,
                error: action.payload
            };

        // ===========================================
        // ORDERS MANAGEMENT CASES
        // ===========================================
        case ADMIN_ORDERS_REQUEST:
            return {
                ...state,
                ordersLoading: true,
                error: null
            };

        case ADMIN_ORDERS_SUCCESS:
            return {
                ...state,
                ordersLoading: false,
                orders: action.payload.orders,
                ordersPagination: action.payload.pagination,
                error: null
            };

        case ADMIN_ORDERS_FAIL:
            return {
                ...state,
                ordersLoading: false,
                error: action.payload
            };

        case ADMIN_ORDER_UPDATE_REQUEST:
            return {
                ...state,
                orderUpdateLoading: true,
                error: null
            };

        case ADMIN_ORDER_UPDATE_SUCCESS:
            return {
                ...state,
                orderUpdateLoading: false,
                success: 'Order status updated successfully',
                error: null
            };

        case ADMIN_ORDER_UPDATE_FAIL:
            return {
                ...state,
                orderUpdateLoading: false,
                error: action.payload
            };

        // ===========================================
        // USERS MANAGEMENT CASES
        // ===========================================
        case ADMIN_USERS_REQUEST:
            return {
                ...state,
                usersLoading: true,
                error: null
            };

        case ADMIN_USERS_SUCCESS:
            return {
                ...state,
                usersLoading: false,
                users: action.payload.users,
                usersPagination: action.payload.pagination,
                error: null
            };

        case ADMIN_USERS_FAIL:
            return {
                ...state,
                usersLoading: false,
                error: action.payload
            };

        // ===========================================
        // UTILITY CASES
        // ===========================================
        case ADMIN_CLEAR_ERRORS:
            return {
                ...state,
                error: null,
                success: null
            };

        default:
            return state;
    }
};

export default adminReducer;
