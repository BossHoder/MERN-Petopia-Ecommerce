import * as types from '../types';

const initialState = {
    loading: false,
    items: [],
    error: null,
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.CART_LOADING:
            return {
                ...state,
                loading: true,
            };
        case types.CART_GET_SUCCESS:
        case types.ADD_TO_CART_SUCCESS:
        case types.UPDATE_CART_ITEM_SUCCESS:
        case types.REMOVE_FROM_CART_SUCCESS:
        case types.CLEAR_CART_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload.items,
                error: null,
            };
        case types.CART_GET_FAIL:
        case types.ADD_TO_CART_FAIL:
        case types.UPDATE_CART_ITEM_FAIL:
        case types.REMOVE_FROM_CART_FAIL:
        case types.CLEAR_CART_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default cartReducer;
