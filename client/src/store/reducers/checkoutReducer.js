import * as types from '../types';

const initialState = {
    step: 1,
    paymentMethod: 'COD',
    shippingAddress: {
        address: '',
        phoneNumber: '',
    },
    preservedState: null,
    isRestored: false,
    // Coupon state
    coupon: {
        applied: null,
        discountAmount: 0,
        loading: false,
        error: null,
    },
};

const checkoutReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.PRESERVE_CHECKOUT_STATE:
            return {
                ...state,
                preservedState: {
                    step: action.payload.step || state.step,
                    paymentMethod: action.payload.paymentMethod || state.paymentMethod,
                    shippingAddress: action.payload.shippingAddress || state.shippingAddress,
                    timestamp: Date.now(),
                },
            };

        case types.RESTORE_CHECKOUT_STATE:
            if (state.preservedState) {
                return {
                    ...state,
                    step: state.preservedState.step,
                    paymentMethod: state.preservedState.paymentMethod,
                    shippingAddress: state.preservedState.shippingAddress,
                    isRestored: true,
                    preservedState: null,
                };
            }
            return state;

        case types.CLEAR_CHECKOUT_STATE:
            return {
                ...initialState,
            };

        case types.UPDATE_CHECKOUT_STEP:
            return {
                ...state,
                step: action.payload,
                isRestored: false,
            };

        case types.UPDATE_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethod: action.payload,
            };

        case types.UPDATE_SHIPPING_ADDRESS:
            return {
                ...state,
                shippingAddress: action.payload,
            };

        // ===========================================
        // COUPON CASES
        // ===========================================
        case types.CHECKOUT_COUPON_APPLY_REQUEST:
            return {
                ...state,
                coupon: {
                    ...state.coupon,
                    loading: true,
                    error: null,
                },
            };

        case types.CHECKOUT_COUPON_APPLY_SUCCESS:
            return {
                ...state,
                coupon: {
                    applied: action.payload.coupon,
                    discountAmount: action.payload.discountAmount,
                    appliedAt: action.payload.appliedAt,
                    loading: false,
                    error: null,
                },
            };

        case types.CHECKOUT_COUPON_APPLY_FAIL:
            return {
                ...state,
                coupon: {
                    ...state.coupon,
                    loading: false,
                    error: action.payload,
                },
            };

        case types.CHECKOUT_COUPON_REMOVE:
            return {
                ...state,
                coupon: {
                    applied: null,
                    discountAmount: 0,
                    loading: false,
                    error: null,
                },
            };

        case types.CHECKOUT_COUPON_CLEAR_ERRORS:
            return {
                ...state,
                coupon: {
                    ...state.coupon,
                    error: null,
                },
            };

        default:
            return state;
    }
};

export default checkoutReducer;
