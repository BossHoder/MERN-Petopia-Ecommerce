import api from '../../services/api';
import * as types from '../types';

export const getProductReviews = (productId) => async (dispatch) => {
    try {
        dispatch({
            type: types.GET_REVIEWS_REQUEST,
            payload: { productId },
        });

        const { data } = await api.get(`/api/reviews/product/${productId}`);

        dispatch({
            type: types.GET_REVIEWS_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: types.GET_REVIEWS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const addProductReview = (productId, review) => async (dispatch) => {
    try {
        dispatch({ type: types.ADD_REVIEW_REQUEST });

        const { data } = await api.post(`/api/products/${productId}/reviews`, review);

        const successAction = {
            type: types.ADD_REVIEW_SUCCESS,
            payload: data.data,
        };

        dispatch(successAction);

        // Return success action so component can detect success
        return successAction;
    } catch (error) {
        const errorAction = {
            type: types.ADD_REVIEW_FAIL,
            payload: error.response?.data?.message || error.message,
        };

        dispatch(errorAction);

        // Return error action
        return errorAction;
    }
};
