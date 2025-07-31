import * as types from '../types';
import API from '../../services/api';

// Action to preserve checkout state when redirecting to profile
export const preserveCheckoutState = (checkoutData) => ({
    type: types.PRESERVE_CHECKOUT_STATE,
    payload: checkoutData,
});

// Action to restore checkout state when returning from profile
export const restoreCheckoutState = () => ({
    type: types.RESTORE_CHECKOUT_STATE,
});

// Action to clear preserved checkout state
export const clearCheckoutState = () => ({
    type: types.CLEAR_CHECKOUT_STATE,
});

// Action to update checkout step
export const updateCheckoutStep = (step) => ({
    type: types.UPDATE_CHECKOUT_STEP,
    payload: step,
});

// Action to update payment method
export const updatePaymentMethod = (paymentMethod) => ({
    type: types.UPDATE_PAYMENT_METHOD,
    payload: paymentMethod,
});

// Action to update shipping address
export const updateShippingAddress = (shippingAddress) => ({
    type: types.UPDATE_SHIPPING_ADDRESS,
    payload: shippingAddress,
});

// ===========================================
// COUPON ACTIONS FOR CHECKOUT
// ===========================================

/**
 * Apply coupon to checkout
 */
export const applyCouponToCheckout =
    (couponCode, orderValue, userId = null) =>
    async (dispatch) => {
        try {
            dispatch({ type: types.CHECKOUT_COUPON_APPLY_REQUEST });

            const response = await API.post('/api/coupons/validate', {
                code: couponCode,
                orderValue,
                userId,
            });

            dispatch({
                type: types.CHECKOUT_COUPON_APPLY_SUCCESS,
                payload: {
                    coupon: response.data.data.coupon,
                    discountAmount: response.data.data.discountAmount,
                    appliedAt: new Date().toISOString(),
                },
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to apply coupon';
            dispatch({
                type: types.CHECKOUT_COUPON_APPLY_FAIL,
                payload: errorMessage,
            });
            throw error;
        }
    };

/**
 * Remove coupon from checkout
 */
export const removeCouponFromCheckout = () => ({
    type: types.CHECKOUT_COUPON_REMOVE,
});

/**
 * Clear coupon errors
 */
export const clearCheckoutCouponErrors = () => ({
    type: types.CHECKOUT_COUPON_CLEAR_ERRORS,
});
