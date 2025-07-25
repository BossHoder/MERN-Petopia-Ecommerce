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

        default:
            return state;
    }
};

export default checkoutReducer;
