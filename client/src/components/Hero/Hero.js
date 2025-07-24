import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Hero.css';

const Hero = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // TODO: Implement search logic or navigation
        // For now, just log
        console.log('Searching for:', searchQuery);
    };

    const scrollToProducts = () => {
        const productsSection = document.getElementById('featured-products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        {t('hero.title', 'Find everything your pet needs')}
                    </h1>
                    <p className="hero-subtitle">
                        {t(
                            'hero.subtitle',
                            'Quality products, expert advice, and a community that loves pets as much as you do.',
                        )}
                    </p>

                    <form className="hero-search-form" onSubmit={handleSearch}>
                        <div className="hero-search-container">
                            <span className="hero-search-icon" aria-hidden="true">
                                {/* Simple search icon SVG, no extra library */}
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9a664c"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder={t(
                                    'hero.searchPlaceholder',
                                    'Search for food, toys, treats...',
                                )}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="hero-search-input"
                            />
                            <button type="submit" className="hero-search-btn">
                                {t('hero.search', 'Search')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Hero;
