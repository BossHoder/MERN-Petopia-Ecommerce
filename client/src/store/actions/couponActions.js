import API from '../../services/api';
import {
    COUPONS_REQUEST,
    COUPONS_SUCCESS,
    COUPONS_FAIL,
    COUPON_BY_CODE_REQUEST,
    COUPON_BY_CODE_SUCCESS,
    COUPON_BY_CODE_FAIL,
    COUPON_VALIDATE_REQUEST,
    COUPON_VALIDATE_SUCCESS,
    COUPON_VALIDATE_FAIL,
    COUPON_CLEAR_ERRORS,
} from '../types';

// ===========================================
// PUBLIC COUPON ACTIONS
// ===========================================

/**
 * Get all active coupons for customers
 */
export const getActiveCoupons =
    (page = 1, limit = 12, search = '', sortBy = 'validUntil', sortOrder = 'asc', filters = {}) =>
    async (dispatch) => {
        try {
            dispatch({ type: COUPONS_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort: sortBy,
                order: sortOrder,
                ...(search && { search }),
                ...(filters.discountType && { discountType: filters.discountType }),
            });

            const response = await API.get(`/api/coupons?${queryParams}`);

            dispatch({
                type: COUPONS_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: COUPONS_FAIL,
                payload: error.response?.data?.error?.message || 'Failed to fetch coupons',
            });
        }
    };

/**
 * Get coupon by code
 */
export const getCouponByCode = (code) => async (dispatch) => {
    try {
        dispatch({ type: COUPON_BY_CODE_REQUEST });

        const response = await API.get(`/api/coupons/${code}`);

        dispatch({
            type: COUPON_BY_CODE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: COUPON_BY_CODE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to fetch coupon',
        });
        throw error;
    }
};

/**
 * Validate coupon for order
 */
export const validateCoupon = (code, orderValue, userId = null) => async (dispatch) => {
    try {
        dispatch({ type: COUPON_VALIDATE_REQUEST });

        const response = await API.post('/api/coupons/validate', {
            code,
            orderValue,
            userId,
        });

        dispatch({
            type: COUPON_VALIDATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: COUPON_VALIDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to validate coupon',
        });
        throw error;
    }
};

/**
 * Clear coupon errors
 */
export const clearCouponErrors = () => (dispatch) => {
    dispatch({ type: COUPON_CLEAR_ERRORS });
};
