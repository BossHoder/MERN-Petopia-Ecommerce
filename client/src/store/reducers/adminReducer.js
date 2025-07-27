import {
    ADMIN_DASHBOARD_STATS_REQUEST,
    ADMIN_DASHBOARD_STATS_SUCCESS,
    ADMIN_DASHBOARD_STATS_FAIL,
    ADMIN_ORDERS_REQUEST,
    ADMIN_ORDERS_SUCCESS,
    ADMIN_ORDERS_FAIL,
    ADMIN_ORDER_UPDATE_REQUEST,
    ADMIN_ORDER_UPDATE_SUCCESS,
    ADMIN_ORDER_UPDATE_FAIL,
    ADMIN_USERS_REQUEST,
    ADMIN_USERS_SUCCESS,
    ADMIN_USERS_FAIL,
    ADMIN_PARENT_CATEGORIES_REQUEST,
    ADMIN_PARENT_CATEGORIES_SUCCESS,
    ADMIN_PARENT_CATEGORIES_FAIL,
    ADMIN_PARENT_CATEGORY_CREATE_REQUEST,
    ADMIN_PARENT_CATEGORY_CREATE_SUCCESS,
    ADMIN_PARENT_CATEGORY_CREATE_FAIL,
    ADMIN_PARENT_CATEGORY_UPDATE_REQUEST,
    ADMIN_PARENT_CATEGORY_UPDATE_SUCCESS,
    ADMIN_PARENT_CATEGORY_UPDATE_FAIL,
    ADMIN_PARENT_CATEGORY_DELETE_REQUEST,
    ADMIN_PARENT_CATEGORY_DELETE_SUCCESS,
    ADMIN_PARENT_CATEGORY_DELETE_FAIL,
    ADMIN_CATEGORIES_REQUEST,
    ADMIN_CATEGORIES_SUCCESS,
    ADMIN_CATEGORIES_FAIL,
    ADMIN_CATEGORY_CREATE_REQUEST,
    ADMIN_CATEGORY_CREATE_SUCCESS,
    ADMIN_CATEGORY_CREATE_FAIL,
    ADMIN_CATEGORY_UPDATE_REQUEST,
    ADMIN_CATEGORY_UPDATE_SUCCESS,
    ADMIN_CATEGORY_UPDATE_FAIL,
    ADMIN_CATEGORY_DELETE_REQUEST,
    ADMIN_CATEGORY_DELETE_SUCCESS,
    ADMIN_CATEGORY_DELETE_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,
    ADMIN_PRODUCT_CREATE_REQUEST,
    ADMIN_PRODUCT_CREATE_SUCCESS,
    ADMIN_PRODUCT_CREATE_FAIL,
    ADMIN_PRODUCT_UPDATE_REQUEST,
    ADMIN_PRODUCT_UPDATE_SUCCESS,
    ADMIN_PRODUCT_UPDATE_FAIL,
    ADMIN_PRODUCT_DELETE_REQUEST,
    ADMIN_PRODUCT_DELETE_SUCCESS,
    ADMIN_PRODUCT_DELETE_FAIL,
    ADMIN_CLEAR_ERRORS,
} from '../types';

const initialState = {
    // Dashboard
    dashboardStats: {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        growth: {
            users: 0,
            orders: 0,
            revenue: 0,
        },
    },
    dashboardLoading: false,

    // Orders Management
    orders: [],
    ordersPagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false,
    },
    ordersLoading: false,
    orderUpdateLoading: false,

    // Users Management
    users: [],
    usersPagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false,
    },
    usersLoading: false,

    // Parent Categories Management
    parentCategories: [],
    parentCategoriesPagination: {
        currentPage: 1,
        totalPages: 1,
        totalParentCategories: 0,
        hasNext: false,
        hasPrev: false,
    },
    parentCategoriesLoading: false,
    parentCategoryCreateLoading: false,
    parentCategoryUpdateLoading: false,
    parentCategoryDeleteLoading: false,

    // Categories Management
    categories: [],
    categoriesPagination: {
        currentPage: 1,
        totalPages: 1,
        totalCategories: 0,
        hasNext: false,
        hasPrev: false,
    },
    categoriesLoading: false,
    categoryCreateLoading: false,
    categoryUpdateLoading: false,
    categoryDeleteLoading: false,

    // Products Management
    products: [],
    productsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNext: false,
        hasPrev: false,
    },
    productsLoading: false,
    productCreateLoading: false,
    productUpdateLoading: false,
    productDeleteLoading: false,

    // Error handling
    error: null,
    success: null,
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        // ===========================================
        // DASHBOARD CASES
        // ===========================================
        case ADMIN_DASHBOARD_STATS_REQUEST:
            return {
                ...state,
                dashboardLoading: true,
                error: null,
            };

        case ADMIN_DASHBOARD_STATS_SUCCESS:
            return {
                ...state,
                dashboardLoading: false,
                dashboardStats: action.payload,
                error: null,
            };

        case ADMIN_DASHBOARD_STATS_FAIL:
            return {
                ...state,
                dashboardLoading: false,
                error: action.payload,
            };

        // ===========================================
        // ORDERS MANAGEMENT CASES
        // ===========================================
        case ADMIN_ORDERS_REQUEST:
            return {
                ...state,
                ordersLoading: true,
                error: null,
            };

        case ADMIN_ORDERS_SUCCESS:
            return {
                ...state,
                ordersLoading: false,
                orders: action.payload.orders,
                ordersPagination: action.payload.pagination,
                error: null,
            };

        case ADMIN_ORDERS_FAIL:
            return {
                ...state,
                ordersLoading: false,
                error: action.payload,
            };

        case ADMIN_ORDER_UPDATE_REQUEST:
            return {
                ...state,
                orderUpdateLoading: true,
                error: null,
            };

        case ADMIN_ORDER_UPDATE_SUCCESS:
            return {
                ...state,
                orderUpdateLoading: false,
                success: 'Order status updated successfully',
                error: null,
            };

        case ADMIN_ORDER_UPDATE_FAIL:
            return {
                ...state,
                orderUpdateLoading: false,
                error: action.payload,
            };

        // ===========================================
        // USERS MANAGEMENT CASES
        // ===========================================
        case ADMIN_USERS_REQUEST:
            return {
                ...state,
                usersLoading: true,
                error: null,
            };

        case ADMIN_USERS_SUCCESS:
            return {
                ...state,
                usersLoading: false,
                users: action.payload.users,
                usersPagination: action.payload.pagination,
                error: null,
            };

        case ADMIN_USERS_FAIL:
            return {
                ...state,
                usersLoading: false,
                error: action.payload,
            };

        // ===========================================
        // PARENT CATEGORIES CASES
        // ===========================================
        case ADMIN_PARENT_CATEGORIES_REQUEST:
            return {
                ...state,
                parentCategoriesLoading: true,
                error: null,
            };

        case ADMIN_PARENT_CATEGORIES_SUCCESS:
            return {
                ...state,
                parentCategoriesLoading: false,
                parentCategories: action.payload.parentCategories,
                parentCategoriesPagination: action.payload.pagination,
                error: null,
            };

        case ADMIN_PARENT_CATEGORIES_FAIL:
            return {
                ...state,
                parentCategoriesLoading: false,
                error: action.payload,
            };

        case ADMIN_PARENT_CATEGORY_CREATE_REQUEST:
            return {
                ...state,
                parentCategoryCreateLoading: true,
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_CREATE_SUCCESS:
            return {
                ...state,
                parentCategoryCreateLoading: false,
                parentCategories: [action.payload.parentCategory, ...state.parentCategories],
                success: 'Parent category created successfully',
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_CREATE_FAIL:
            return {
                ...state,
                parentCategoryCreateLoading: false,
                error: action.payload,
            };

        case ADMIN_PARENT_CATEGORY_UPDATE_REQUEST:
            return {
                ...state,
                parentCategoryUpdateLoading: true,
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_UPDATE_SUCCESS:
            return {
                ...state,
                parentCategoryUpdateLoading: false,
                parentCategories: state.parentCategories.map((pc) =>
                    pc._id === action.payload.parentCategory._id
                        ? action.payload.parentCategory
                        : pc,
                ),
                success: 'Parent category updated successfully',
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_UPDATE_FAIL:
            return {
                ...state,
                parentCategoryUpdateLoading: false,
                error: action.payload,
            };

        case ADMIN_PARENT_CATEGORY_DELETE_REQUEST:
            return {
                ...state,
                parentCategoryDeleteLoading: true,
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_DELETE_SUCCESS:
            return {
                ...state,
                parentCategoryDeleteLoading: false,
                parentCategories: Array.isArray(action.payload)
                    ? state.parentCategories.filter((pc) => !action.payload.includes(pc._id))
                    : state.parentCategories.filter((pc) => pc._id !== action.payload),
                success: 'Parent category deleted successfully',
                error: null,
            };

        case ADMIN_PARENT_CATEGORY_DELETE_FAIL:
            return {
                ...state,
                parentCategoryDeleteLoading: false,
                error: action.payload,
            };

        // ===========================================
        // CATEGORIES CASES
        // ===========================================
        case ADMIN_CATEGORIES_REQUEST:
            return {
                ...state,
                categoriesLoading: true,
                error: null,
            };

        case ADMIN_CATEGORIES_SUCCESS:
            return {
                ...state,
                categoriesLoading: false,
                categories: action.payload.categories,
                categoriesPagination: action.payload.pagination,
                error: null,
            };

        case ADMIN_CATEGORIES_FAIL:
            return {
                ...state,
                categoriesLoading: false,
                error: action.payload,
            };

        case ADMIN_CATEGORY_CREATE_REQUEST:
            return {
                ...state,
                categoryCreateLoading: true,
                error: null,
            };

        case ADMIN_CATEGORY_CREATE_SUCCESS:
            return {
                ...state,
                categoryCreateLoading: false,
                categories: [action.payload.category, ...state.categories],
                success: 'Category created successfully',
                error: null,
            };

        case ADMIN_CATEGORY_CREATE_FAIL:
            return {
                ...state,
                categoryCreateLoading: false,
                error: action.payload,
            };

        case ADMIN_CATEGORY_UPDATE_REQUEST:
            return {
                ...state,
                categoryUpdateLoading: true,
                error: null,
            };

        case ADMIN_CATEGORY_UPDATE_SUCCESS:
            return {
                ...state,
                categoryUpdateLoading: false,
                categories: state.categories.map((c) =>
                    c._id === action.payload.category._id ? action.payload.category : c,
                ),
                success: 'Category updated successfully',
                error: null,
            };

        case ADMIN_CATEGORY_UPDATE_FAIL:
            return {
                ...state,
                categoryUpdateLoading: false,
                error: action.payload,
            };

        case ADMIN_CATEGORY_DELETE_REQUEST:
            return {
                ...state,
                categoryDeleteLoading: true,
                error: null,
            };

        case ADMIN_CATEGORY_DELETE_SUCCESS:
            return {
                ...state,
                categoryDeleteLoading: false,
                categories: Array.isArray(action.payload)
                    ? state.categories.filter((c) => !action.payload.includes(c._id))
                    : state.categories.filter((c) => c._id !== action.payload),
                success: 'Category deleted successfully',
                error: null,
            };

        case ADMIN_CATEGORY_DELETE_FAIL:
            return {
                ...state,
                categoryDeleteLoading: false,
                error: action.payload,
            };

        // ===========================================
        // PRODUCTS CASES
        // ===========================================
        case ADMIN_PRODUCTS_REQUEST:
            return {
                ...state,
                productsLoading: true,
                error: null,
            };

        case ADMIN_PRODUCTS_SUCCESS:
            return {
                ...state,
                productsLoading: false,
                products: action.payload.products,
                productsPagination: action.payload.pagination,
                error: null,
            };

        case ADMIN_PRODUCTS_FAIL:
            return {
                ...state,
                productsLoading: false,
                error: action.payload,
            };

        case ADMIN_PRODUCT_CREATE_REQUEST:
            return {
                ...state,
                productCreateLoading: true,
                error: null,
            };

        case ADMIN_PRODUCT_CREATE_SUCCESS:
            return {
                ...state,
                productCreateLoading: false,
                products: [action.payload.product, ...state.products],
                success: 'Product created successfully',
                error: null,
            };

        case ADMIN_PRODUCT_CREATE_FAIL:
            return {
                ...state,
                productCreateLoading: false,
                error: action.payload,
            };

        case ADMIN_PRODUCT_UPDATE_REQUEST:
            return {
                ...state,
                productUpdateLoading: true,
                error: null,
            };

        case ADMIN_PRODUCT_UPDATE_SUCCESS:
            return {
                ...state,
                productUpdateLoading: false,
                products: state.products.map((p) =>
                    p._id === action.payload.product._id ? action.payload.product : p,
                ),
                success: 'Product updated successfully',
                error: null,
            };

        case ADMIN_PRODUCT_UPDATE_FAIL:
            return {
                ...state,
                productUpdateLoading: false,
                error: action.payload,
            };

        case ADMIN_PRODUCT_DELETE_REQUEST:
            return {
                ...state,
                productDeleteLoading: true,
                error: null,
            };

        case ADMIN_PRODUCT_DELETE_SUCCESS:
            return {
                ...state,
                productDeleteLoading: false,
                products: Array.isArray(action.payload)
                    ? state.products.filter((p) => !action.payload.includes(p._id))
                    : state.products.filter((p) => p._id !== action.payload),
                success: 'Product deleted successfully',
                error: null,
            };

        case ADMIN_PRODUCT_DELETE_FAIL:
            return {
                ...state,
                productDeleteLoading: false,
                error: action.payload,
            };

        // ===========================================
        // UTILITY CASES
        // ===========================================
        case ADMIN_CLEAR_ERRORS:
            return {
                ...state,
                error: null,
                success: null,
            };

        default:
            return state;
    }
};

export default adminReducer;
