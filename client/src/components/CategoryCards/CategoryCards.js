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
                    <div className="category-error">
                        {t('categories.error', 'Không thể tải danh mục. Vui lòng thử lại sau.')}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="category-cards">
            <div className="category-cards-container">
                <h2 className="category-cards-title">Shop by Category</h2>

                <div className="category-cards-grid">
                    {featuredCategories.map((category) => (
                        <a
                            key={category.id}
                            href={'/category/' + category.slug}
                            className="category-card-link"
                        >
                            <div className="category-card">
                                <div
                                    className="category-image"
                                    style={{
                                        backgroundImage: `url(${
                                            category.image ||
                                            '/placeholder.svg?height=160&width=160'
                                        })`,
                                    }}
                                />
                                <p className="category-name">{category.name}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryCards;
