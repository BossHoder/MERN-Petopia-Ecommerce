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

    useEffect(() => {
        dispatch(fetchParentCategories());
        dispatch(getAllCategories());
    }, [dispatch]);

    const handleParentClick = (parentId) => {
        if (selectedParent === parentId) {
            setSelectedParent(''); // Toggle: đóng nếu đang mở
            setSelectedCategory('');
            onFilterChange({ parentCategoryId: '', category: '', ...localFilters });
        } else {
            setSelectedParent(parentId);
            setSelectedCategory('');
            onFilterChange({ parentCategoryId: parentId, category: '', ...localFilters });
        }
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        onFilterChange({ parentCategoryId: selectedParent, category: categoryId, ...localFilters });
    };

    const handleChange = (e) => {
        setLocalFilters({
            ...localFilters,
            [e.target.name]: e.target.value,
        });
    };

    const handleApplyFilters = () => {
        onFilterChange({
            parentCategoryId: selectedParent,
            category: selectedCategory,
            ...localFilters,
        });
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleInStockToggle = () => {
        setInStock(!inStock);
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
                        <span className="filter-section-title">Categories</span>
                        {expandedSections.categories ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.categories && (
                        <div className="filter-section-content">
                            {parentCategoriesLoading ? (
                                <div className="loading-text">
                                    {t('common.loading', 'Loading...')}
                                </div>
                            ) : (
                                <ul className="parent-category-list">
                                    {parentCategories.map((parent) => (
                                        <li
                                            key={parent._id || parent.id}
                                            className="parent-category-item"
                                        >
                                            <button
                                                className={`parent-category-btn${
                                                    selectedParent === parent._id ? ' active' : ''
                                                }`}
                                                onClick={() => handleParentClick(parent._id)}
                                            >
                                                {parent.iconUrl && (
                                                    <img
                                                        src={parent.iconUrl}
                                                        alt=""
                                                        className="category-icon"
                                                    />
                                                )}
                                                <span className="category-name">{parent.name}</span>
                                                <span className="category-count">
                                                    {parent.productCount}
                                                </span>
                                                <span className="category-arrow">
                                                    {selectedParent === parent._id ? (
                                                        <ChevronDown />
                                                    ) : (
                                                        <ChevronRight />
                                                    )}
                                                </span>
                                            </button>
                                            {selectedParent === parent._id && (
                                                <ul className="category-list">
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
                                                                        selectedCategory === cat._id
                                                                            ? ' active'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleCategoryClick(cat._id)
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
                                    ))}
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
                        <span className="filter-section-title">Price</span>
                        {expandedSections.price ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    {expandedSections.price && (
                        <div className="filter-section-content">
                            <div className="price-range-slider">
                                <div className="slider-track">
                                    <div
                                        className="slider-range"
                                        style={{ left: '10%', width: '60%' }}
                                    ></div>
                                    <div className="slider-thumb" style={{ left: '10%' }}></div>
                                    <div className="slider-thumb" style={{ left: '70%' }}></div>
                                </div>
                                <div className="price-labels">
                                    <span>$0</span>
                                    <span>$100+</span>
                                </div>
                            </div>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder={t('sidebar.min', 'Min')}
                                    value={localFilters.minPrice}
                                    onChange={handleChange}
                                    className="price-input"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder={t('sidebar.max', 'Max')}
                                    value={localFilters.maxPrice}
                                    onChange={handleChange}
                                    className="price-input"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* In Stock Toggle */}
                <div className="filter-section">
                    <div className="filter-section-header toggle-header">
                        <span className="filter-section-title">In Stock</span>
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
                        <span className="filter-section-title">Brand</span>
                        {expandedSections.brand ? <ChevronDown /> : <ChevronRight />}
                    </button>
                </div>
                {/* Customer Rating Section */}
                <div className="filter-section">
                    <button
                        className="filter-section-header"
                        onClick={() => toggleSection('rating')}
                    >
                        <span className="filter-section-title">Customer Rating</span>
                        {expandedSections.rating ? <ChevronDown /> : <ChevronRight />}
                    </button>
                </div>
                {/* Special Diet Section */}
                <div className="filter-section">
                    <button className="filter-section-header" onClick={() => toggleSection('diet')}>
                        <span className="filter-section-title">Special Diet</span>
                        {expandedSections.diet ? <ChevronDown /> : <ChevronRight />}
                    </button>
                </div>
            </div>
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
                {t('sidebar.applyFilters', 'Apply Filters')}
            </button>
        </aside>
    );
};

export default Sidebar;
