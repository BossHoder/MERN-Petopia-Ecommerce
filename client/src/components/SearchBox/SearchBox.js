import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductSuggestions } from '../../store/actions/productActions';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css';

const SearchBox = () => {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = async (e) => {
        const value = e.target.value;
        setKeyword(value);
        if (value.length > 1) {
            const result = await dispatch(fetchProductSuggestions(value));
            setSuggestions(result);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (suggestion) => {
        setKeyword('');
        setSuggestions([]);
        // Điều hướng theo type
        if (suggestion.type === 'product') {
            navigate(`/product/${suggestion.slug}`);
        } else if (suggestion.type === 'category') {
            navigate(
                `/category/${suggestion.parentCategory?.slug || 'unknown'}/${suggestion.slug}`,
            );
        } else if (suggestion.type === 'parentCategory') {
            navigate(`/category/${suggestion.slug}`);
        }
    };

    return (
        <div className="search-box">
            <input
                value={keyword}
                onChange={handleChange}
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                autoComplete="off"
            />
            {suggestions.length > 0 && (
                <ul className="suggestion-list">
                    {suggestions.map((s) => (
                        <li key={s.id} onClick={() => handleSelect(s)}>
                            {s.label} <span className="type">{s.type}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
