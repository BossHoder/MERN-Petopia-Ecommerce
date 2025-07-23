import * as types from '../types';

const initialState = {
    reviews: [],
    loading: false,
    error: null,
    success: false, // For tracking add review success
};

export const reviewListReducer = (state = { reviews: [] }, action) => {
    switch (action.type) {
        case types.GET_REVIEWS_REQUEST:
            return { loading: true, reviews: [] };
        case types.GET_REVIEWS_SUCCESS:
            return { loading: false, reviews: action.payload };
        case types.GET_REVIEWS_FAIL:
            return { loading: false, error: action.payload };
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
