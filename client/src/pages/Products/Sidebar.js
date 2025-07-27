import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllCategories, fetchParentCategories } from '../../store/actions/categoryActions';
import './Sidebar.css';

const ChevronDown = () => (
    <svg
        className="filter-section-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);
const ChevronRight = () => (
    <svg
        className="filter-section-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const Sidebar = ({ onFilterChange }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { categories, categoriesLoading, parentCategories, parentCategoriesLoading } =
        useSelector((state) => state.categories);

    const [selectedParent, setSelectedParent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [localFilters, setLocalFilters] = useState({
        minPrice: '',
        maxPrice: '',
    });
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        brand: false,
        rating: false,
        diet: false,
    });
    const [inStock, setInStock] = useState(true);
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);

    useEffect(() => {
        dispatch(fetchParentCategories());
        dispatch(getAllCategories());
        fetchBrands();
    }, [dispatch]);

    const fetchBrands = async () => {
        try {
            setLoadingBrands(true);
            console.log('Fetching brands...');
            const response = await fetch('/api/products/brands');
            console.log('Brands response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Brands data received:', data);
                // Backend trả về: { success: true, data: { brands: [...] } }
                const brandsArray = data.data?.brands || [];
                console.log('Brands array:', brandsArray);
                setBrands(brandsArray);
            } else {
                console.error('Failed to fetch brands, status:', response.status);
                const errorData = await response.json();
                console.error('Error response:', errorData);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleParentClick = (parentSlug) => {
        if (selectedParent === parentSlug) {
            // Toggle: đóng nếu đang mở
            setSelectedParent('');
            setSelectedCategory('');
            onFilterChange({
                parentCategory: '',
                category: '',
                brand: selectedBrand,
                minRating: selectedRating,
                inStock,
                ...localFilters,
            });
        } else {
            // Mở parent category mới và đóng tất cả các parent khác
            setSelectedParent(parentSlug);
            setSelectedCategory(''); // Reset category selection khi chuyển parent
            onFilterChange({
                parentCategory: parentSlug,
                category: '',
                brand: selectedBrand,
                minRating: selectedRating,
                inStock,
                ...localFilters,
            });
        }
    };

    const handleCategoryClick = (categorySlug) => {
        setSelectedCategory(categorySlug);
        onFilterChange({
            parentCategory: selectedParent,
            category: categorySlug,
            brand: selectedBrand,
            minRating: selectedRating,
            inStock,
            ...localFilters,
        });
    };

    const handleBrandClick = (brand) => {
        const newBrand = selectedBrand === brand ? '' : brand;
        setSelectedBrand(newBrand);
        onFilterChange({
            parentCategory: selectedParent,
            category: selectedCategory,
            brand: newBrand,
            minRating: selectedRating,
            inStock,
            ...localFilters,
        });
    };

    const handleRatingClick = (rating) => {
        const newRating = selectedRating === rating ? '' : rating;
        setSelectedRating(newRating);
        onFilterChange({
            parentCategory: selectedParent,
            category: selectedCategory,
            brand: selectedBrand,
            minRating: newRating,
            inStock,
            ...localFilters,
        });
    };

    const handleChange = (e) => {
        setLocalFilters({
            ...localFilters,
            [e.target.name]: e.target.value,
        });
    };

    const handleApplyFilters = () => {
        onFilterChange({
            parentCategory: selectedParent,
            category: selectedCategory,
            brand: selectedBrand,
            minRating: selectedRating,
            inStock,
            ...localFilters,
        });
    };

    const handlePriceChange = (e) => {
        const newFilters = {
            ...localFilters,
            [e.target.name]: e.target.value,
        };
        setLocalFilters(newFilters);

        // Apply price filter immediately
        onFilterChange({
            parentCategory: selectedParent,
            category: selectedCategory,
            brand: selectedBrand,
            minRating: selectedRating,
            inStock,
            ...newFilters,
        });
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleInStockToggle = () => {
        const newInStock = !inStock;
        setInStock(newInStock);
        onFilterChange({
            parentCategoryId: selectedParent,
            category: selectedCategory,
            brand: selectedBrand,
            minRating: selectedRating,
            inStock: newInStock,
            ...localFilters,
        });
    };

    return (
        <aside className="products-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Filters</h2>
            </div>
            <div className="filter-sections">
                {/* Categories Section */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('categories')}
                    >
                        <span className="filter-section-title">{t('sidebar.categories')}</span>
                        {expandedSections.categories ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.categories && (
                        <div className="filter-section-content">
                            {parentCategoriesLoading ? (
                                <div className="loading-text">{t('common.loading')}</div>
                            ) : (
                                <ul className="parent-category-list">
                                    {parentCategories.map((parent) => {
                                        // Fallback to _id if slug doesn't exist
                                        const parentKey = parent.slug || parent._id;
                                        const isActive = selectedParent === parentKey;

                                        return (
                                            <li
                                                key={parent._id || parent.id}
                                                className="parent-category-item"
                                            >
                                                <button
                                                    className={`parent-category-btn${
                                                        isActive ? ' active' : ''
                                                    }`}
                                                    onClick={() => handleParentClick(parentKey)}
                                                >
                                                    {parent.iconUrl && (
                                                        <img
                                                            src={parent.iconUrl}
                                                            alt=""
                                                            className="category-icon"
                                                        />
                                                    )}
                                                    <span className="category-name">
                                                        {parent.name}
                                                    </span>
                                                    <span className="category-count">
                                                        {parent.productCount}
                                                    </span>
                                                    <span className="category-arrow">
                                                        {isActive ? (
                                                            <ChevronDown />
                                                        ) : (
                                                            <ChevronRight />
                                                        )}
                                                    </span>
                                                </button>
                                                {isActive && (
                                                    <ul
                                                        className="category-list"
                                                        title={
                                                            categories.filter(
                                                                (cat) =>
                                                                    String(
                                                                        cat.parentCategory?._id ||
                                                                            cat.parentCategory,
                                                                    ) === String(parent._id),
                                                            ).length > 4
                                                                ? t('sidebar.scrollToSeeMore')
                                                                : ''
                                                        }
                                                    >
                                                        {categories
                                                            .filter(
                                                                (cat) =>
                                                                    String(
                                                                        cat.parentCategory?._id ||
                                                                            cat.parentCategory,
                                                                    ) === String(parent._id),
                                                            )
                                                            .map((cat) => (
                                                                <li
                                                                    key={cat._id || cat.id}
                                                                    className="category-item"
                                                                >
                                                                    <button
                                                                        className={`category-btn${
                                                                            selectedCategory ===
                                                                            cat.slug
                                                                                ? ' active'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleCategoryClick(
                                                                                cat.slug,
                                                                            )
                                                                        }
                                                                    >
                                                                        <span className="category-name">
                                                                            {cat.name}
                                                                        </span>
                                                                        <span className="category-count">
                                                                            {cat.productCount}
                                                                        </span>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                {/* Price Range Section */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('price')}
                    >
                        <span className="filter-section-title">{t('sidebar.priceRange')}</span>
                        {expandedSections.price ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.price && (
                        <div className="filter-section-content">
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder={t('sidebar.min')}
                                    value={localFilters.minPrice}
                                    onChange={handlePriceChange}
                                    className="price-input"
                                    min="0"
                                />
                                <span className="price-separator">-</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder={t('sidebar.max')}
                                    value={localFilters.maxPrice}
                                    onChange={handlePriceChange}
                                    className="price-input"
                                    min="0"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Brand Filter */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('brand')}
                    >
                        <span className="filter-section-title">{t('sidebar.brand')}</span>
                        {expandedSections.brand ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.brand && (
                        <div className="filter-section-content">
                            {loadingBrands ? (
                                <div className="loading-brands">Loading brands...</div>
                            ) : brands.length > 0 ? (
                                <ul className="brand-list">
                                    {brands.map((brand) => (
                                        <li key={brand} className="brand-item">
                                            <button
                                                className={`brand-btn${
                                                    selectedBrand === brand ? ' active' : ''
                                                }`}
                                                onClick={() => handleBrandClick(brand)}
                                            >
                                                <span className="brand-name">{brand}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-brands">No brands available</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Rating Filter */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('rating')}
                    >
                        <span className="filter-section-title">{t('sidebar.rating')}</span>
                        {expandedSections.rating ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.rating && (
                        <div className="filter-section-content">
                            <ul className="rating-list">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <li key={rating} className="rating-item">
                                        <button
                                            className={`rating-btn${
                                                selectedRating === rating.toString()
                                                    ? ' active'
                                                    : ''
                                            }`}
                                            onClick={() => handleRatingClick(rating.toString())}
                                        >
                                            <div className="rating-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`star ${
                                                            i < rating ? 'filled' : 'empty'
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="rating-text">
                                                {rating} sao trở lên
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* In Stock Toggle */}
                <div className="filter-section">
                    <div className="filter-section-header toggle-header">
                        <span className="filter-section-title">Còn hàng </span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={handleInStockToggle}
                                className="toggle-input"
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                {/* Brand Section */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('brand')}
                    >
                        <span className="filter-section-title">{t('sidebar.brand')}</span>
                        {expandedSections.brand ? <ChevronDown /> : <ChevronRight />}
                    </button>
                </div>
            </div>
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
                {t('sidebar.applyFilters')}
            </button>
        </aside>
    );
};

export default Sidebar;
