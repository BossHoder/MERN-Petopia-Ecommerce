import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllCategories } from '../../store/actions/categoryActions';
import './Sidebar.css';

const kebabToCamel = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

const Sidebar = ({ onFilterChange }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);

    const [localFilters, setLocalFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
    });

    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    const handleChange = (e) => {
        setLocalFilters({
            ...localFilters,
            [e.target.name]: e.target.value,
        });
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
    };

    return (
        <aside className="products-sidebar">
            <div className="filter-group">
                <h3>{t('sidebar.categories', 'Categories')}</h3>
                {loading ? (
                    <p>{t('common.loading', 'Loading...')}</p>
                ) : (
                    <select name="category" value={localFilters.category} onChange={handleChange}>
                        <option value="">{t('sidebar.all', 'All')}</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {t(`categoriesList.${kebabToCamel(cat.slug)}`, cat.name)}
                            </option>
                        ))}
                    </select>
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

            {/* Thêm các bộ lọc khác ở đây, ví dụ: brand, ratings... */}

            <button className="btn btn-primary" onClick={handleApplyFilters}>
                {t('sidebar.applyFilters', 'Apply Filters')}
            </button>
        </aside>
    );
};

export default Sidebar;
