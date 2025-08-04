import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFeaturedCategories } from '../../store/actions/categoryActions';
import Loader from '../Loader/Loader';
import './CategoryCards.css';

const kebabToCamel = (str) => str.replace(/-./g, (m) => m.toUpperCase()[1]);

const CategoryCards = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { featuredCategories, featuredLoading, error } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(getFeaturedCategories());
    }, [dispatch]);

    // Category icon mapping based on slug
    const getCategoryIcon = (slug) => {
        const iconMap = {
            'dry-dog-food': '🥘',
            'dry-cat-food': '🐱',
            'dog-crates-beds-houses': '🏠',
            'cat-crates-beds-houses': '🛏️',
            'dog-toys': '🎾',
            'cat-toys': '🧸',
            'dog-bones-treats': '🦴',
            'cat-treats': '🐟',
        };
        return iconMap[slug] || '🐾';
    };

    if (featuredLoading) {
        return (
            <section className="category-cards">
                <div className="category-cards-container">
                    <Loader />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="category-cards">
                <div className="category-cards-container">
                    <div className="category-error">{t('categories.error')}</div>
                </div>
            </section>
        );
    }
};

export default CategoryCards;
