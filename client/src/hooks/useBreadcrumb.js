import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for generating breadcrumb navigation data
 * Automatically generates breadcrumbs based on current route and context
 * 
 * @param {string} type - Type of breadcrumb ('auto', 'product', 'category', 'custom')
 * @param {string} id - ID for specific item (product ID, category slug, etc.)
 * @param {Array} customItems - Custom breadcrumb items for manual override
 * @returns {Array} Array of breadcrumb items
 */
export const useBreadcrumb = (type = 'auto', id = null, customItems = null) => {
    const location = useLocation();
    const params = useParams();
    const { t } = useTranslation('common');
    
    // Redux state
    const { product } = useSelector((state) => state.products || {});
    const { categories, parentCategories } = useSelector((state) => state.categories || {});
    const { user } = useSelector((state) => state.auth || {});
    
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper function to find category by slug
    const findCategoryBySlug = (slug) => {
        return categories?.find(cat => cat.slug === slug);
    };

    // Helper function to find parent category by slug
    const findParentCategoryBySlug = (slug) => {
        return parentCategories?.find(parent => parent.slug === slug);
    };

    // Generate breadcrumbs based on route
    const generateBreadcrumbs = useMemo(() => {
        const pathname = location.pathname;
        const items = [];

        // Handle custom items override
        if (customItems && Array.isArray(customItems)) {
            return customItems;
        }

        // Route-based breadcrumb generation
        switch (true) {
            // Home page
            case pathname === '/':
                return [];

            // Products page
            case pathname === '/products':
                items.push({
                    name: t('navigation.products', 'Products'),
                    path: '/products',
                    slug: 'products',
                    current: true
                });
                break;

            // Product details page
            case pathname.startsWith('/product/'):
                items.push({
                    name: t('navigation.products', 'Products'),
                    path: '/products',
                    slug: 'products'
                });
                
                if (product && product.name) {
                    // Add category breadcrumbs if available
                    if (product.category) {
                        const category = findCategoryBySlug(product.category);
                        if (category && category.parentCategory) {
                            const parentCategory = findParentCategoryBySlug(category.parentCategory.slug);
                            if (parentCategory) {
                                items.push({
                                    name: parentCategory.name,
                                    path: `/category/${parentCategory.slug}`,
                                    slug: parentCategory.slug
                                });
                            }
                            items.push({
                                name: category.name,
                                path: `/category/${category.parentCategory?.slug}/${category.slug}`,
                                slug: category.slug
                            });
                        }
                    }
                    
                    items.push({
                        name: product.name,
                        path: pathname,
                        slug: product.slug || params.id,
                        current: true
                    });
                }
                break;

            // Category pages
            case pathname.startsWith('/category/'):
                const pathParts = pathname.split('/').filter(Boolean);
                
                if (pathParts.length === 2) {
                    // Parent category page: /category/dogs
                    const parentSlug = pathParts[1];
                    const parentCategory = findParentCategoryBySlug(parentSlug);
                    
                    if (parentCategory) {
                        items.push({
                            name: parentCategory.name,
                            path: `/category/${parentCategory.slug}`,
                            slug: parentCategory.slug,
                            current: true
                        });
                    }
                } else if (pathParts.length === 3) {
                    // Subcategory page: /category/dogs/dog-food
                    const parentSlug = pathParts[1];
                    const categorySlug = pathParts[2];
                    
                    const parentCategory = findParentCategoryBySlug(parentSlug);
                    const category = findCategoryBySlug(categorySlug);
                    
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
                }
                break;

            // Cart page
            case pathname === '/cart':
                items.push({
                    name: t('navigation.cart', 'Shopping Cart'),
                    path: '/cart',
                    slug: 'cart',
                    current: true
                });
                break;

            // Checkout page
            case pathname === '/checkout':
                items.push({
                    name: t('navigation.cart', 'Shopping Cart'),
                    path: '/cart',
                    slug: 'cart'
                });
                items.push({
                    name: t('navigation.checkout', 'Checkout'),
                    path: '/checkout',
                    slug: 'checkout',
                    current: true
                });
                break;

            // Order details page
            case pathname.startsWith('/order/'):
                items.push({
                    name: t('navigation.profile', 'Profile'),
                    path: '/profile',
                    slug: 'profile'
                });
                items.push({
                    name: t('navigation.orders', 'Orders'),
                    path: '/profile',
                    slug: 'orders'
                });
                items.push({
                    name: t('navigation.orderDetails', 'Order Details'),
                    path: pathname,
                    slug: 'order-details',
                    current: true
                });
                break;

            // Profile page
            case pathname === '/profile':
            case pathname.startsWith('/@'):
                items.push({
                    name: t('navigation.profile', 'Profile'),
                    path: '/profile',
                    slug: 'profile',
                    current: true
                });
                break;

            // Admin pages
            case pathname.startsWith('/admin'):
                items.push({
                    name: t('navigation.admin', 'Admin'),
                    path: '/admin',
                    slug: 'admin'
                });
                
                if (pathname === '/admin') {
                    items[items.length - 1].current = true;
                }
                break;

            // Users management
            case pathname === '/users':
                items.push({
                    name: t('navigation.admin', 'Admin'),
                    path: '/admin',
                    slug: 'admin'
                });
                items.push({
                    name: t('navigation.users', 'Users'),
                    path: '/users',
                    slug: 'users',
                    current: true
                });
                break;

            // Login/Register pages
            case pathname === '/login':
                items.push({
                    name: t('navigation.login', 'Login'),
                    path: '/login',
                    slug: 'login',
                    current: true
                });
                break;

            case pathname === '/register':
                items.push({
                    name: t('navigation.register', 'Register'),
                    path: '/register',
                    slug: 'register',
                    current: true
                });
                break;

            // Default case for unknown routes
            default:
                // Try to generate breadcrumbs from URL segments
                const segments = pathname.split('/').filter(Boolean);
                segments.forEach((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const path = '/' + segments.slice(0, index + 1).join('/');
                    
                    items.push({
                        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                        path: path,
                        slug: segment,
                        current: isLast
                    });
                });
                break;
        }

        return items;
    }, [location.pathname, params, product, categories, parentCategories, t, customItems]);

    // Update breadcrumb items when dependencies change
    useEffect(() => {
        setBreadcrumbItems(generateBreadcrumbs);
    }, [generateBreadcrumbs]);

    // Return breadcrumb data and utilities
    return {
        items: breadcrumbItems,
        loading,
        setCustomItems: (items) => setBreadcrumbItems(items),
        refresh: () => setBreadcrumbItems(generateBreadcrumbs)
    };
};
