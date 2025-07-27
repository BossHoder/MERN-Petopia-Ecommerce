import API from '../../services/api';
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

// ===========================================
// DASHBOARD ACTIONS
// ===========================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_DASHBOARD_STATS_REQUEST });

        const response = await API.get('/api/admin/dashboard/stats');

        dispatch({
            type: ADMIN_DASHBOARD_STATS_SUCCESS,
            payload: response.data.data,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_DASHBOARD_STATS_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to fetch dashboard stats',
        });
    }
};

// ===========================================
// ORDERS MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all orders for admin
 */
export const getAdminOrders =
    (page = 1, limit = 10, status = 'all', search = '') =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_ORDERS_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status !== 'all' && { status }),
                ...(search && { search }),
            });

            const response = await API.get(`/api/admin/orders?${queryParams}`);

            dispatch({
                type: ADMIN_ORDERS_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: ADMIN_ORDERS_FAIL,
                payload: error.response?.data?.error?.message || 'Failed to fetch orders',
            });
        }
    };

/**
 * Update order status
 */
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_ORDER_UPDATE_REQUEST });

        const response = await API.put(`/api/admin/orders/${orderId}/status`, { status });

        dispatch({
            type: ADMIN_ORDER_UPDATE_SUCCESS,
            payload: response.data.data,
        });

        // Refresh orders list after update
        dispatch(getAdminOrders());
    } catch (error) {
        dispatch({
            type: ADMIN_ORDER_UPDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to update order status',
        });
    }
};

// ===========================================
// USERS MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all users for admin
 */
export const getAdminUsers =
    (page = 1, limit = 10, search = '') =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_USERS_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            });

            const response = await API.get(`/api/admin/users?${queryParams}`);

            dispatch({
                type: ADMIN_USERS_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: ADMIN_USERS_FAIL,
                payload: error.response?.data?.error?.message || 'Failed to fetch users',
            });
        }
    };

// ===========================================
// PARENT CATEGORIES MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all parent categories for admin
 */
export const getAdminParentCategories =
    (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc') =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_PARENT_CATEGORIES_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
                ...(search && { search }),
            });

            const response = await API.get(`/api/admin/parent-categories?${queryParams}`);

            dispatch({
                type: ADMIN_PARENT_CATEGORIES_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: ADMIN_PARENT_CATEGORIES_FAIL,
                payload:
                    error.response?.data?.error?.message || 'Failed to fetch parent categories',
            });
        }
    };

/**
 * Create parent category
 */
export const createParentCategory = (parentCategoryData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PARENT_CATEGORY_CREATE_REQUEST });

        const response = await API.post('/api/admin/parent-categories', parentCategoryData);

        dispatch({
            type: ADMIN_PARENT_CATEGORY_CREATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_PARENT_CATEGORY_CREATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to create parent category',
        });
        throw error;
    }
};

/**
 * Update parent category
 */
export const updateParentCategory = (id, parentCategoryData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PARENT_CATEGORY_UPDATE_REQUEST });

        const response = await API.put(`/api/admin/parent-categories/${id}`, parentCategoryData);

        dispatch({
            type: ADMIN_PARENT_CATEGORY_UPDATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_PARENT_CATEGORY_UPDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to update parent category',
        });
        throw error;
    }
};

/**
 * Delete parent category
 */
export const deleteParentCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PARENT_CATEGORY_DELETE_REQUEST });

        await API.delete(`/api/admin/parent-categories/${id}`);

        dispatch({
            type: ADMIN_PARENT_CATEGORY_DELETE_SUCCESS,
            payload: id,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_PARENT_CATEGORY_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete parent category',
        });
        throw error;
    }
};

/**
 * Bulk delete parent categories
 */
export const bulkDeleteParentCategories = (ids) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PARENT_CATEGORY_DELETE_REQUEST });

        await API.post('/api/admin/parent-categories/bulk-delete', { ids });

        dispatch({
            type: ADMIN_PARENT_CATEGORY_DELETE_SUCCESS,
            payload: ids,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_PARENT_CATEGORY_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete parent categories',
        });
        throw error;
    }
};

// ===========================================
// CATEGORIES MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all categories for admin
 */
export const getAdminCategories =
    (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc') =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_CATEGORIES_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
                ...(search && { search }),
            });

            const response = await API.get(`/api/admin/categories?${queryParams}`);

            dispatch({
                type: ADMIN_CATEGORIES_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: ADMIN_CATEGORIES_FAIL,
                payload: error.response?.data?.error?.message || 'Failed to fetch categories',
            });
        }
    };

/**
 * Create category
 */
export const createCategory = (categoryData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_CATEGORY_CREATE_REQUEST });

        const response = await API.post('/api/admin/categories', categoryData);

        dispatch({
            type: ADMIN_CATEGORY_CREATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_CATEGORY_CREATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to create category',
        });
        throw error;
    }
};

/**
 * Update category
 */
export const updateCategory = (id, categoryData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_CATEGORY_UPDATE_REQUEST });

        const response = await API.put(`/api/admin/categories/${id}`, categoryData);

        dispatch({
            type: ADMIN_CATEGORY_UPDATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_CATEGORY_UPDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to update category',
        });
        throw error;
    }
};

/**
 * Delete category
 */
export const deleteCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_CATEGORY_DELETE_REQUEST });

        await API.delete(`/api/admin/categories/${id}`);

        dispatch({
            type: ADMIN_CATEGORY_DELETE_SUCCESS,
            payload: id,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_CATEGORY_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete category',
        });
        throw error;
    }
};

/**
 * Bulk delete categories
 */
export const bulkDeleteCategories = (ids) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_CATEGORY_DELETE_REQUEST });

        await API.post('/api/admin/categories/bulk-delete', { ids });

        dispatch({
            type: ADMIN_CATEGORY_DELETE_SUCCESS,
            payload: ids,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_CATEGORY_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete categories',
        });
        throw error;
    }
};

// ===========================================
// PRODUCTS MANAGEMENT ACTIONS
// ===========================================

/**
 * Get all products for admin
 */
export const getAdminProducts =
    (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc') =>
    async (dispatch) => {
        try {
            dispatch({ type: ADMIN_PRODUCTS_REQUEST });

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
                ...(search && { search }),
            });

            const response = await API.get(`/api/admin/products?${queryParams}`);

            dispatch({
                type: ADMIN_PRODUCTS_SUCCESS,
                payload: response.data.data,
            });
        } catch (error) {
            dispatch({
                type: ADMIN_PRODUCTS_FAIL,
                payload: error.response?.data?.error?.message || 'Failed to fetch products',
            });
        }
    };

/**
 * Create product
 */
export const createProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCT_CREATE_REQUEST });

        const response = await API.post('/api/admin/products', productData);

        dispatch({
            type: ADMIN_PRODUCT_CREATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCT_CREATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to create product',
        });
        throw error;
    }
};

/**
 * Update product
 */
export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCT_UPDATE_REQUEST });

        const response = await API.put(`/api/admin/products/${id}`, productData);

        dispatch({
            type: ADMIN_PRODUCT_UPDATE_SUCCESS,
            payload: response.data.data,
        });

        return response.data;
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCT_UPDATE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to update product',
        });
        throw error;
    }
};

/**
 * Delete product
 */
export const deleteProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCT_DELETE_REQUEST });

        await API.delete(`/api/admin/products/${id}`);

        dispatch({
            type: ADMIN_PRODUCT_DELETE_SUCCESS,
            payload: id,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCT_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete product',
        });
        throw error;
    }
};

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = (ids) => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCT_DELETE_REQUEST });

        await API.post('/api/admin/products/bulk-delete', { ids });

        dispatch({
            type: ADMIN_PRODUCT_DELETE_SUCCESS,
            payload: ids,
        });
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCT_DELETE_FAIL,
            payload: error.response?.data?.error?.message || 'Failed to delete products',
        });
        throw error;
    }
};

// ===========================================
// UTILITY ACTIONS
// ===========================================

/**
 * Clear admin errors
 */
export const clearAdminErrors = () => (dispatch) => {
    dispatch({ type: ADMIN_CLEAR_ERRORS });
};
