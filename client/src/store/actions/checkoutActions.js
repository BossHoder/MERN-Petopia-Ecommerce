import * as types from '../types';

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
