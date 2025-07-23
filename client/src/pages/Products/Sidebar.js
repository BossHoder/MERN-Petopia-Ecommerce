import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategories } from '../../store/actions/categoryActions';
import './Sidebar.css';

const Sidebar = ({ onFilterChange }) => {
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
                <h3>Categories</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <select name="category" value={localFilters.category} onChange={handleChange}>
                        <option value="">All</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="filter-group">
                <h3>Price Range</h3>
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={localFilters.minPrice}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={localFilters.maxPrice}
                    onChange={handleChange}
                />
            </div>

            {/* Thêm các bộ lọc khác ở đây, ví dụ: brand, ratings... */}

            <button className="btn btn-primary" onClick={handleApplyFilters}>
                Apply Filters
            </button>
        </aside>
    );
};

export default Sidebar;
