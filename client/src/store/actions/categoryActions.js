import axios from 'axios';
import {
    GET_FEATURED_CATEGORIES_LOADING,
    GET_FEATURED_CATEGORIES_SUCCESS,
    GET_FEATURED_CATEGORIES_FAIL,
    GET_ALL_CATEGORIES_LOADING,
    GET_ALL_CATEGORIES_SUCCESS,
    GET_ALL_CATEGORIES_FAIL,
    CLEAR_CATEGORY_ERRORS,
    GET_PARENT_CATEGORIES_LOADING,
    GET_PARENT_CATEGORIES_SUCCESS,
    GET_PARENT_CATEGORIES_FAIL,
} from '../types';

// Get featured categories for homepage
export const getFeaturedCategories = () => async (dispatch) => {
    try {
        dispatch({ type: GET_FEATURED_CATEGORIES_LOADING });

        const response = await axios.get('/api/categories/featured');

        dispatch({
            type: GET_FEATURED_CATEGORIES_SUCCESS,
            payload: response.data.data.categories,
        });
    } catch (error) {
        dispatch({
            type: GET_FEATURED_CATEGORIES_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch featured categories',
        });
    }
};

// Get all categories
export const getAllCategories = () => async (dispatch) => {
    try {
        dispatch({ type: GET_ALL_CATEGORIES_LOADING });

        const response = await axios.get('/api/categories');

        dispatch({
            type: GET_ALL_CATEGORIES_SUCCESS,
            payload: response.data.data.categories,
        });
    } catch (error) {
        dispatch({
            type: GET_ALL_CATEGORIES_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch categories',
        });
    }
};

// Clear errors
export const clearCategoryErrors = () => ({
    type: CLEAR_CATEGORY_ERRORS,
});

// Get all parent categories
export const fetchParentCategories = () => async (dispatch) => {
    try {
        dispatch({ type: GET_PARENT_CATEGORIES_LOADING });
        const response = await axios.get('/api/categories/parent-categories');
        dispatch({
            type: GET_PARENT_CATEGORIES_SUCCESS,
            payload: response.data.data.parentCategories,
        });
    } catch (error) {
        dispatch({
            type: GET_PARENT_CATEGORIES_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch parent categories',
        });
    }
};
