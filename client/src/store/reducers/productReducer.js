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

const initialState = {
    // Featured products
    featuredProducts: [],
    featuredLoading: false,

    // Bestsellers
    bestsellers: [],
    bestsellersLoading: false,

    // All products with pagination
    products: [],
    pagination: null,
    filters: null,
    productsLoading: false,

    // Single product
    currentProduct: null,
    relatedProducts: [],
    productLoading: false,

    // Errors
    error: null,
};

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        // Featured Products
        case GET_FEATURED_PRODUCTS_LOADING:
            return {
                ...state,
                featuredLoading: true,
                error: null,
            };

        case GET_FEATURED_PRODUCTS_SUCCESS:
            return {
                ...state,
                featuredProducts: action.payload,
                featuredLoading: false,
                error: null,
            };

        case GET_FEATURED_PRODUCTS_FAIL:
            return {
                ...state,
                featuredLoading: false,
                error: action.payload,
            };

        // Bestsellers
        case GET_BESTSELLERS_LOADING:
            return {
                ...state,
                bestsellersLoading: true,
                error: null,
            };

        case GET_BESTSELLERS_SUCCESS:
            return {
                ...state,
                bestsellers: action.payload,
                bestsellersLoading: false,
                error: null,
            };

        case GET_BESTSELLERS_FAIL:
            return {
                ...state,
                bestsellersLoading: false,
                error: action.payload,
            };

        // All Products
        case GET_ALL_PRODUCTS_LOADING:
            return {
                ...state,
                productsLoading: true,
                error: null,
            };

        case GET_ALL_PRODUCTS_SUCCESS:
            return {
                ...state,
                products: action.payload.products,
                pagination: action.payload.pagination,
                filters: action.payload.filters,
                productsLoading: false,
                error: null,
            };

        case GET_ALL_PRODUCTS_FAIL:
            return {
                ...state,
                productsLoading: false,
                error: action.payload,
            };

        // Single Product
        case GET_PRODUCT_BY_ID_LOADING:
            return {
                ...state,
                productLoading: true,
                error: null,
            };

        case GET_PRODUCT_BY_ID_SUCCESS:
            return {
                ...state,
                currentProduct: action.payload.product,
                relatedProducts: action.payload.relatedProducts,
                productLoading: false,
                error: null,
            };

        case GET_PRODUCT_BY_ID_FAIL:
            return {
                ...state,
                productLoading: false,
                error: action.payload,
            };

        case CLEAR_PRODUCT_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

export default productReducer;
