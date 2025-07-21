import {
    GET_FEATURED_CATEGORIES_LOADING,
    GET_FEATURED_CATEGORIES_SUCCESS,
    GET_FEATURED_CATEGORIES_FAIL,
    GET_ALL_CATEGORIES_LOADING,
    GET_ALL_CATEGORIES_SUCCESS,
    GET_ALL_CATEGORIES_FAIL,
    CLEAR_CATEGORY_ERRORS,
} from '../types';

const initialState = {
    // Featured categories for homepage
    featuredCategories: [],
    featuredLoading: false,

    // All categories
    categories: [],
    categoriesLoading: false,

    // Errors
    error: null,
};

const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        // Featured Categories
        case GET_FEATURED_CATEGORIES_LOADING:
            return {
                ...state,
                featuredLoading: true,
                error: null,
            };

        case GET_FEATURED_CATEGORIES_SUCCESS:
            return {
                ...state,
                featuredCategories: action.payload,
                featuredLoading: false,
                error: null,
            };

        case GET_FEATURED_CATEGORIES_FAIL:
            return {
                ...state,
                featuredLoading: false,
                error: action.payload,
            };

        // All Categories
        case GET_ALL_CATEGORIES_LOADING:
            return {
                ...state,
                categoriesLoading: true,
                error: null,
            };

        case GET_ALL_CATEGORIES_SUCCESS:
            return {
                ...state,
                categories: action.payload,
                categoriesLoading: false,
                error: null,
            };

        case GET_ALL_CATEGORIES_FAIL:
            return {
                ...state,
                categoriesLoading: false,
                error: action.payload,
            };

        case CLEAR_CATEGORY_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

export default categoryReducer;
