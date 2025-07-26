import {
    SET_BREADCRUMB_ITEMS,
    CLEAR_BREADCRUMB_ITEMS,
    UPDATE_BREADCRUMB_LOADING,
    SET_BREADCRUMB_ERROR,
    CLEAR_BREADCRUMB_ERROR,
} from '../types';

/**
 * Set breadcrumb items
 * @param {Array} items - Array of breadcrumb items
 */
export const setBreadcrumbItems = (items) => ({
    type: SET_BREADCRUMB_ITEMS,
    payload: items,
});

/**
 * Clear all breadcrumb items
 */
export const clearBreadcrumbItems = () => ({
    type: CLEAR_BREADCRUMB_ITEMS,
});

/**
 * Update breadcrumb loading state
 * @param {boolean} loading - Loading state
 */
export const updateBreadcrumbLoading = (loading) => ({
    type: UPDATE_BREADCRUMB_LOADING,
    payload: loading,
});

/**
 * Set breadcrumb error
 * @param {string} error - Error message
 */
export const setBreadcrumbError = (error) => ({
    type: SET_BREADCRUMB_ERROR,
    payload: error,
});

/**
 * Clear breadcrumb error
 */
export const clearBreadcrumbError = () => ({
    type: CLEAR_BREADCRUMB_ERROR,
});

/**
 * Generate breadcrumb items for product
 * @param {string} productId - Product ID
 */
export const generateProductBreadcrumb = (productId) => async (dispatch, getState) => {
    try {
        dispatch(updateBreadcrumbLoading(true));
        dispatch(clearBreadcrumbError());

        const state = getState();
        const { products, categories } = state;
        
        // Find product in state
        const product = products.product || products.products?.find(p => p._id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        const items = [];
        
        // Add Products breadcrumb
        items.push({
            name: 'Products',
            path: '/products',
            slug: 'products'
        });

        // Add category breadcrumbs if available
        if (product.category) {
            const category = categories.categories?.find(cat => cat._id === product.category);
            if (category && category.parentCategory) {
                const parentCategory = categories.parentCategories?.find(
                    parent => parent._id === category.parentCategory
                );
                
                if (parentCategory) {
                    items.push({
                        name: parentCategory.name,
                        path: `/category/${parentCategory.slug}`,
                        slug: parentCategory.slug
                    });
                }
                
                items.push({
                    name: category.name,
                    path: `/category/${parentCategory?.slug}/${category.slug}`,
                    slug: category.slug
                });
            }
        }

        // Add product breadcrumb
        items.push({
            name: product.name,
            path: `/product/${product._id}`,
            slug: product.slug || product._id,
            current: true
        });

        dispatch(setBreadcrumbItems(items));
    } catch (error) {
        dispatch(setBreadcrumbError(error.message));
    } finally {
        dispatch(updateBreadcrumbLoading(false));
    }
};

/**
 * Generate breadcrumb items for category
 * @param {string} categorySlug - Category slug
 * @param {string} parentSlug - Parent category slug (optional)
 */
export const generateCategoryBreadcrumb = (categorySlug, parentSlug = null) => async (dispatch, getState) => {
    try {
        dispatch(updateBreadcrumbLoading(true));
        dispatch(clearBreadcrumbError());

        const state = getState();
        const { categories } = state;
        
        const items = [];

        if (parentSlug) {
            // Subcategory page
            const parentCategory = categories.parentCategories?.find(parent => parent.slug === parentSlug);
            const category = categories.categories?.find(cat => cat.slug === categorySlug);

            if (parentCategory) {
                items.push({
                    name: parentCategory.name,
                    path: `/category/${parentCategory.slug}`,
                    slug: parentCategory.slug
                });
            }

            if (category) {
                items.push({
                    name: category.name,
                    path: `/category/${parentSlug}/${category.slug}`,
                    slug: category.slug,
                    current: true
                });
            }
        } else {
            // Parent category page
            const parentCategory = categories.parentCategories?.find(parent => parent.slug === categorySlug);
            
            if (parentCategory) {
                items.push({
                    name: parentCategory.name,
                    path: `/category/${parentCategory.slug}`,
                    slug: parentCategory.slug,
                    current: true
                });
            }
        }

        dispatch(setBreadcrumbItems(items));
    } catch (error) {
        dispatch(setBreadcrumbError(error.message));
    } finally {
        dispatch(updateBreadcrumbLoading(false));
    }
};

/**
 * Generate custom breadcrumb items
 * @param {Array} customItems - Custom breadcrumb items
 */
export const setCustomBreadcrumb = (customItems) => (dispatch) => {
    dispatch(setBreadcrumbItems(customItems));
};
