import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css';
import { useI18n } from '../../hooks/useI18n';

const SearchBox = () => {
    const { t } = useI18n('common');
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products?search=${keyword}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <form onSubmit={submitHandler} className="search-box">
            <input
                type="text"
                name="q"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('common.searchProducts')}
                className="search-input"
            />
            <button type="submit" className="search-button">
                {t('common.search')}
            </button>
        </form>
    );
};

export default SearchBox;
