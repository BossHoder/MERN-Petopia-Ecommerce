import {
    SET_BREADCRUMB_ITEMS,
    CLEAR_BREADCRUMB_ITEMS,
    UPDATE_BREADCRUMB_LOADING,
    SET_BREADCRUMB_ERROR,
    CLEAR_BREADCRUMB_ERROR,
} from '../types';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const breadcrumbReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_BREADCRUMB_ITEMS:
            return {
                ...state,
                items: action.payload,
                error: null,
            };

        case CLEAR_BREADCRUMB_ITEMS:
            return {
                ...state,
                items: [],
                error: null,
            };

        case UPDATE_BREADCRUMB_LOADING:
            return {
                ...state,
                loading: action.payload,
            };

        case SET_BREADCRUMB_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case CLEAR_BREADCRUMB_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

export default breadcrumbReducer;
