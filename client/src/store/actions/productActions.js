import API from '../../services/api';
import {
    GET_FEATURED_PRODUCTS_LOADING,
    GET_FEATURED_PRODUCTS_SUCCESS,
    GET_FEATURED_PRODUCTS_FAIL,
    GET_BESTSELLERS_LOADING,
    GET_BESTSELLERS_SUCCESS,
    GET_BESTSELLERS_FAIL,
    GET_ALL_PRODUCTS_LOADING,
    GET_ALL_PRODUCTS_SUCCESS,
    GET_ALL_PRODUCTS_FAIL,
    GET_PRODUCT_BY_ID_LOADING,
    GET_PRODUCT_BY_ID_SUCCESS,
    GET_PRODUCT_BY_ID_FAIL,
    CLEAR_PRODUCT_ERRORS,
} from '../types';

// Get featured products
export const getFeaturedProducts =
    (limit = 8) =>
    async (dispatch) => {
        try {
            dispatch({ type: GET_FEATURED_PRODUCTS_LOADING });

            const response = await API.get(`/api/products/featured?limit=${limit}`);

            dispatch({
                type: GET_FEATURED_PRODUCTS_SUCCESS,
                payload: response.data.data.products,
            });
        } catch (error) {
            dispatch({
                type: GET_FEATURED_PRODUCTS_FAIL,
                payload: error.response?.data?.message || 'Failed to fetch featured products',
            });
        }
    };

// Get bestsellers (using salesCount)
export const getBestsellers =
    (limit = 8) =>
    async (dispatch) => {
        try {
            dispatch({ type: GET_BESTSELLERS_LOADING });

            const response = await API.get(
                `/api/products?sortBy=salesCount&sortOrder=desc&limit=${limit}`,
            );

            dispatch({
                type: GET_BESTSELLERS_SUCCESS,
                payload: response.data.data.products,
            });
        } catch (error) {
            dispatch({
                type: GET_BESTSELLERS_FAIL,
                payload: error.response?.data?.message || 'Failed to fetch bestsellers',
            });
        }
    };

// Get all products with filters
export const getAllProducts =
    (filters = {}) =>
    async (dispatch) => {
        try {
            dispatch({ type: GET_ALL_PRODUCTS_LOADING });

            // Set default limit to 4 products per page if not specified
            const defaultFilters = {
                limit: 4,
                ...filters,
            };

            const queryParams = new URLSearchParams(defaultFilters).toString();
            const response = await API.get(`/api/products?${queryParams}`);

            dispatch({
                type: GET_ALL_PRODUCTS_SUCCESS,
                payload: {
                    products: response.data.data.products,
                    pagination: response.data.data.pagination,
                    filters: response.data.data.filters,
                },
            });
        } catch (error) {
            dispatch({
                type: GET_ALL_PRODUCTS_FAIL,
                payload: error.response?.data?.message || 'Failed to fetch products',
            });
        }
    };

// Get single product
export const getProductById = (id) => async (dispatch) => {
    try {
        dispatch({ type: GET_PRODUCT_BY_ID_LOADING });

        const response = await API.get(`/api/products/${id}`);

        dispatch({
            type: GET_PRODUCT_BY_ID_SUCCESS,
            payload: {
                product: response.data.data.product,
                relatedProducts: response.data.data.relatedProducts,
            },
        });
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || 'Failed to fetch product. Please try again.';
        dispatch({
            type: GET_PRODUCT_BY_ID_FAIL,
            payload: errorMessage,
        });
    }
};

export const fetchProductSuggestions = (keyword) => async (dispatch) => {
    try {
        const response = await API.get(
            `/api/products/suggest?keyword=${encodeURIComponent(keyword)}`,
        );
        return response.data.data.suggestions;
    } catch (error) {
        return [];
    }
};

// Clear errors
export const clearProductErrors = () => ({
    type: CLEAR_PRODUCT_ERRORS,
});
