import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllCategories, fetchParentCategories } from '../../store/actions/categoryActions';
import './Sidebar.css';

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

    useEffect(() => {
        dispatch(fetchParentCategories());
        dispatch(getAllCategories());
    }, [dispatch]);

    const handleParentClick = (parentId) => {
        setSelectedParent(parentId);
        setSelectedCategory('');
        onFilterChange({ parentCategoryId: parentId, category: '', ...localFilters });
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

    return (
        <aside className="products-sidebar">
            <div className="filter-group">
                <h3>{t('sidebar.categories', 'Categories')}</h3>
                {parentCategoriesLoading ? (
                    <p>{t('common.loading', 'Loading...')}</p>
                ) : (
                    <ul className="parent-category-list">
                        {parentCategories.map((parent) => (
                            <li
                                key={parent._id}
                                className={selectedParent === parent._id ? 'active' : ''}
                            >
                                <button
                                    className="parent-category-btn"
                                    onClick={() => handleParentClick(parent._id)}
                                    aria-expanded={selectedParent === parent._id}
                                >
                                    {/* Icon nếu có */}
                                    {parent.iconUrl && (
                                        <img
                                            src={parent.iconUrl}
                                            alt=""
                                            className="category-icon"
                                        />
                                    )}
                                    {parent.name}
                                    <span className="count">{parent.productCount}</span>
                                    <span className="arrow">
                                        {selectedParent === parent._id ? '▼' : '▶'}
                                    </span>
                                </button>
                                <ul
                                    className={`category-list${
                                        selectedParent === parent._id ? ' expanded' : ''
                                    }`}
                                >
                                    {categories
                                        .filter(
                                            (cat) =>
                                                String(
                                                    cat.parentCategory?._id || cat.parentCategory,
                                                ) === String(parent._id),
                                        )
                                        .map((cat) => (
                                            <li
                                                key={cat._id}
                                                className={
                                                    selectedCategory === cat._id ? 'active' : ''
                                                }
                                            >
                                                <button
                                                    className="category-btn"
                                                    onClick={() => handleCategoryClick(cat._id)}
                                                >
                                                    {cat.name}
                                                    <span className="count">
                                                        {cat.productCount}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="filter-group">
                <h3>{t('sidebar.priceRange', 'Price Range')}</h3>
                <input
                    type="number"
                    name="minPrice"
                    placeholder={t('sidebar.min', 'Min')}
                    value={localFilters.minPrice}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder={t('sidebar.max', 'Max')}
                    value={localFilters.maxPrice}
                    onChange={handleChange}
                />
            </div>

            <button className="btn btn-primary" onClick={handleApplyFilters}>
                {t('sidebar.applyFilters', 'Apply Filters')}
            </button>
        </aside>
    );
};

export default Sidebar;
