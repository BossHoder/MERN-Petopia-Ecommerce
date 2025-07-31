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
// COUPON REDUCER
// ===========================================

const initialState = {
    // Coupons list
    coupons: [],
    couponsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCoupons: 0,
        hasNext: false,
        hasPrev: false,
    },
    couponsLoading: false,

    // Single coupon
    currentCoupon: null,
    couponLoading: false,

    // Coupon validation
    validationResult: null,
    validationLoading: false,

    // Error handling
    error: null,
    success: null,
};

const couponReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===========================================
        // COUPONS LIST CASES
        // ===========================================
        case COUPONS_REQUEST:
            return {
                ...state,
                couponsLoading: true,
                error: null,
            };

        case COUPONS_SUCCESS:
            return {
                ...state,
                couponsLoading: false,
                coupons: action.payload.coupons,
                couponsPagination: action.payload.pagination,
                error: null,
            };

        case COUPONS_FAIL:
            return {
                ...state,
                couponsLoading: false,
                coupons: [],
                error: action.payload,
            };

        // ===========================================
        // SINGLE COUPON CASES
        // ===========================================
        case COUPON_BY_CODE_REQUEST:
            return {
                ...state,
                couponLoading: true,
                error: null,
            };

        case COUPON_BY_CODE_SUCCESS:
            return {
                ...state,
                couponLoading: false,
                currentCoupon: action.payload,
                error: null,
            };

        case COUPON_BY_CODE_FAIL:
            return {
                ...state,
                couponLoading: false,
                currentCoupon: null,
                error: action.payload,
            };

        // ===========================================
        // COUPON VALIDATION CASES
        // ===========================================
        case COUPON_VALIDATE_REQUEST:
            return {
                ...state,
                validationLoading: true,
                error: null,
            };

        case COUPON_VALIDATE_SUCCESS:
            return {
                ...state,
                validationLoading: false,
                validationResult: action.payload,
                error: null,
            };

        case COUPON_VALIDATE_FAIL:
            return {
                ...state,
                validationLoading: false,
                validationResult: null,
                error: action.payload,
            };

        // ===========================================
        // UTILITY CASES
        // ===========================================
        case COUPON_CLEAR_ERRORS:
            return {
                ...state,
                error: null,
                success: null,
            };

        default:
            return state;
    }
};

export default couponReducer;
