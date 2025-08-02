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
                    <h1 className="hero-title">{t('hero.title')}</h1>
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
