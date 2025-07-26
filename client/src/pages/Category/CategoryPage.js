import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllCategories, fetchParentCategories } from '../../store/actions/categoryActions';
import { getAllProducts } from '../../store/actions/productActions';
import BreadcrumbNavigation from '../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import Notification from '../../components/Notification/Notification';
import './CategoryPage.css';

const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation('common');

    // Redux state
    const {
        parentCategories,
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useSelector((state) => state.categories);
    const {
        products,
        loading: productsLoading,
        error: productsError,
    } = useSelector((state) => state.products);

    // Local state
    const [currentParentCategory, setCurrentParentCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState([]);

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('category', slug);

    // Load data on component mount
    useEffect(() => {
        dispatch(fetchParentCategories());
        dispatch(getAllCategories());
        dispatch(getAllProducts());
    }, [dispatch]);

    // Find current parent category and its subcategories
    useEffect(() => {
        if (parentCategories && categories && slug) {
            const parentCategory = parentCategories.find((parent) => parent.slug === slug);

            if (parentCategory) {
                setCurrentParentCategory(parentCategory);

                // Find subcategories for this parent category
                const relatedSubcategories = categories.filter(
                    (cat) =>
                        String(cat.parentCategory?._id || cat.parentCategory) ===
                        String(parentCategory._id),
                );
                setSubcategories(relatedSubcategories);
            } else {
                // If parent category not found, redirect to 404
                navigate('/notfound');
            }
        }
    }, [parentCategories, categories, slug, navigate]);

    // Filter products for this parent category
    useEffect(() => {
        if (products && currentParentCategory && subcategories.length > 0) {
            const subcategoryIds = subcategories.map((sub) => sub._id);
            const filteredProducts = products.filter((product) =>
                subcategoryIds.includes(product.category?._id || product.category),
            );
            setCategoryProducts(filteredProducts);
        }
    }, [products, currentParentCategory, subcategories]);

    // Loading state
    if (categoriesLoading || productsLoading) {
        return (
            <div className="category-page">
                <div className="category-container">
                    <Loader />
                </div>
            </div>
        );
    }

    // Error state
    if (categoriesError || productsError) {
        return (
            <div className="category-page">
                <div className="category-container">
                    <Notification type="error">{categoriesError || productsError}</Notification>
                </div>
            </div>
        );
    }

    // Not found state
    if (!currentParentCategory) {
        return (
            <div className="category-page">
                <div className="category-container">
                    <Notification type="error">
                        {t('category.notFound', 'Category not found')}
                    </Notification>
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            <div className="category-container">
                {/* Breadcrumb Navigation */}
                <BreadcrumbNavigation
                    items={breadcrumbItems}
                    ariaLabel={t('breadcrumb.categoryNavigation', 'Category navigation')}
                />

                {/* Category Header */}
                <div className="category-header">
                    <h1 className="category-title">{currentParentCategory.name}</h1>
                    {currentParentCategory.description && (
                        <p className="category-description">{currentParentCategory.description}</p>
                    )}
                    <div className="category-stats">
                        <span className="subcategory-count">
                            {subcategories.length} {t('category.subcategories', 'subcategories')}
                        </span>
                        <span className="product-count">
                            {categoryProducts.length} {t('category.products', 'products')}
                        </span>
                    </div>
                </div>

                {/* Subcategories Grid */}
                {subcategories.length > 0 && (
                    <div className="subcategories-section">
                        <h2 className="section-title">
                            {t('category.shopBySubcategory', 'Shop by Subcategory')}
                        </h2>
                        <div className="subcategories-grid">
                            {subcategories.map((subcategory) => (
                                <div
                                    key={subcategory._id}
                                    className="subcategory-card"
                                    onClick={() =>
                                        navigate(`/category/${slug}/${subcategory.slug}`)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            navigate(`/category/${slug}/${subcategory.slug}`);
                                        }
                                    }}
                                >
                                    <div className="subcategory-image">
                                        <img
                                            src={
                                                subcategory.iconUrl ||
                                                '/images/category-placeholder.jpg'
                                            }
                                            alt={subcategory.name}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="subcategory-info">
                                        <h3 className="subcategory-name">{subcategory.name}</h3>
                                        {subcategory.description && (
                                            <p className="subcategory-description">
                                                {subcategory.description}
                                            </p>
                                        )}
                                        <span className="subcategory-product-count">
                                            {subcategory.productCount || 0}{' '}
                                            {t('category.products', 'products')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Products */}
                {categoryProducts.length > 0 && (
                    <div className="featured-products-section">
                        <h2 className="section-title">
                            {t('category.featuredProducts', 'Featured Products')}
                        </h2>
                        <div className="products-grid">
                            {categoryProducts.slice(0, 8).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        {categoryProducts.length > 8 && (
                            <div className="view-all-products">
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(`/products?category=${currentParentCategory.slug}`)
                                    }
                                >
                                    {t('category.viewAllProducts', 'View All Products')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {subcategories.length === 0 && categoryProducts.length === 0 && (
                    <div className="empty-category">
                        <div className="empty-icon">🐾</div>
                        <h3>{t('category.emptyTitle', 'No products yet')}</h3>
                        <p>
                            {t(
                                'category.emptyMessage',
                                'This category is being prepared. Check back soon!',
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
