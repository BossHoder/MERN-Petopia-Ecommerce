import * as types from '../types';

const initialState = {
    reviews: [],
    loading: false,
    error: null,
    currentProductId: null, // Track which product's reviews are currently loaded
};

export const reviewListReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.GET_REVIEWS_REQUEST:
            return {
                ...state,
                loading: true,
                reviews: [],
                error: null,
                currentProductId: action.payload?.productId || null,
            };
        case types.GET_REVIEWS_SUCCESS:
            return {
                ...state,
                loading: false,
                reviews: action.payload,
                error: null,
            };
        case types.GET_REVIEWS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
                reviews: [],
            };
        default:
            return state;
    }
};

export const reviewAddReducer = (state = {}, action) => {
    switch (action.type) {
        case types.ADD_REVIEW_REQUEST:
            return { loading: true };
        case types.ADD_REVIEW_SUCCESS:
            return { loading: false, success: true, review: action.payload };
        case types.ADD_REVIEW_FAIL:
            return { loading: false, error: action.payload };
        case types.ADD_REVIEW_RESET:
            return {};
        default:
            return state;
    }
};
