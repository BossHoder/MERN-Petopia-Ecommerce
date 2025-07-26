import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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

const SubcategoryPage = () => {
    const { parentSlug, categorySlug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation('common');
    const [searchParams, setSearchParams] = useSearchParams();

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
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('subcategory', categorySlug);

    // Load data on component mount
    useEffect(() => {
        dispatch(fetchParentCategories());
        dispatch(getAllCategories());
        dispatch(getAllProducts());
    }, [dispatch]);

    // Find current categories
    useEffect(() => {
        if (parentCategories && categories && parentSlug && categorySlug) {
            const parentCategory = parentCategories.find((parent) => parent.slug === parentSlug);
            const category = categories.find((cat) => cat.slug === categorySlug);

            if (parentCategory && category) {
                // Verify that the category belongs to the parent category
                const categoryParentId = category.parentCategory?._id || category.parentCategory;
                if (String(categoryParentId) === String(parentCategory._id)) {
                    setCurrentParentCategory(parentCategory);
                    setCurrentCategory(category);
                } else {
                    navigate('/notfound');
                }
            } else {
                navigate('/notfound');
            }
        }
    }, [parentCategories, categories, parentSlug, categorySlug, navigate]);

    // Filter products for this category
    useEffect(() => {
        if (products && currentCategory) {
            const filtered = products.filter(
                (product) =>
                    String(product.category?._id || product.category) ===
                    String(currentCategory._id),
            );
            setCategoryProducts(filtered);
        }
    }, [products, currentCategory]);

    // Apply sorting and filtering
    useEffect(() => {
        let filtered = [...categoryProducts];

        // Apply search filter if exists
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Apply price filter if exists
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        if (minPrice) {
            filtered = filtered.filter((product) => product.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter((product) => product.price <= parseFloat(maxPrice));
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'rating':
                    aValue = a.ratings || 0;
                    bValue = b.ratings || 0;
                    break;
                case 'newest':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'name':
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
            }

            if (sortOrder === 'desc') {
                return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        setFilteredProducts(filtered);
    }, [categoryProducts, sortBy, sortOrder, searchParams]);

    // Handle sort change
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

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
    if (!currentCategory || !currentParentCategory) {
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
        <div className="category-page subcategory-page">
            <div className="category-container">
                {/* Breadcrumb Navigation */}
                <BreadcrumbNavigation
                    items={breadcrumbItems}
                    ariaLabel={t('breadcrumb.subcategoryNavigation', 'Subcategory navigation')}
                />

                {/* Category Header */}
                <div className="category-header">
                    <div className="category-title-section">
                        <h1 className="category-title">{currentCategory.name}</h1>
                        <span className="parent-category-link">
                            in{' '}
                            <button
                                className="link-button"
                                onClick={() => navigate(`/category/${parentSlug}`)}
                            >
                                {currentParentCategory.name}
                            </button>
                        </span>
                    </div>
                    {currentCategory.description && (
                        <p className="category-description">{currentCategory.description}</p>
                    )}
                    <div className="category-stats">
                        <span className="product-count">
                            {filteredProducts.length} {t('category.products', 'products')}
                        </span>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="category-controls">
                    <div className="sort-controls">
                        <label htmlFor="sort-select">{t('category.sortBy', 'Sort by')}:</label>
                        <select
                            id="sort-select"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder);
                            }}
                        >
                            <option value="name-asc">{t('category.nameAsc', 'Name A-Z')}</option>
                            <option value="name-desc">{t('category.nameDesc', 'Name Z-A')}</option>
                            <option value="price-asc">
                                {t('category.priceLowHigh', 'Price Low to High')}
                            </option>
                            <option value="price-desc">
                                {t('category.priceHighLow', 'Price High to Low')}
                            </option>
                            <option value="rating-desc">
                                {t('category.ratingHighLow', 'Highest Rated')}
                            </option>
                            <option value="newest-desc">
                                {t('category.newest', 'Newest First')}
                            </option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="products-section">
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="empty-category">
                        <div className="empty-icon">🐾</div>
                        <h3>{t('category.noProducts', 'No products found')}</h3>
                        <p>
                            {t(
                                'category.noProductsMessage',
                                'Try adjusting your filters or check back later.',
                            )}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/category/${parentSlug}`)}
                        >
                            {t('category.backToParent', 'Back to')} {currentParentCategory.name}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubcategoryPage;
