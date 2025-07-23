import * as types from '../types';

const initialState = {
    addresses: [],
    loading: false,
    error: null,
};

export const addressReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case types.GET_ADDRESSES_LOADING:
        case types.UPDATE_ADDRESS_REQUEST:
        case types.DELETE_ADDRESS_REQUEST:
        case types.SET_DEFAULT_ADDRESS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case types.GET_ADDRESSES_SUCCESS:
        case types.ADD_ADDRESS_SUCCESS:
        case types.UPDATE_ADDRESS_SUCCESS:
        case types.DELETE_ADDRESS_SUCCESS:
        case types.SET_DEFAULT_ADDRESS_SUCCESS:
            return {
                ...state,
                loading: false,
                addresses: payload.addresses, // Giả sử API luôn trả về list address đã cập nhật
            };

        case types.GET_ADDRESSES_FAILURE:
        case types.ADD_ADDRESS_FAIL:
        case types.UPDATE_ADDRESS_FAIL:
        case types.DELETE_ADDRESS_FAIL:
        case types.SET_DEFAULT_ADDRESS_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };

        default:
            return state;
    }
};
