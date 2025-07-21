import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Hero.css';

const Hero = () => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero images for carousel
    const heroImages = [
        {
            src: 'https://images.pexels.com/photos/4498189/pexels-photo-4498189.jpeg?auto=compress&cs=tinysrgb&w=1200',
            alt: 'Happy pets with family',
        },
        {
            src: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=1200',
            alt: 'Dog playing with toys',
        },
        {
            src: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=1200',
            alt: 'Cat enjoying premium food',
        },
    ];

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 7000);

        return () => clearInterval(interval);
    }, [heroImages.length]);

    const handleShopNow = () => {
        // Scroll to products section or navigate to shop
        const productsSection = document.getElementById('featured-products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Khoảnh Khắc Vui Vẻ, Trọn Vẹn Yêu Thương</h1>
                        <p className="hero-subtitle">
                            Khám phá đồ chơi, thức ăn và phụ kiện an toàn, mang lại niềm vui cho cả
                            nhà!
                        </p>
                        <button className="hero-cta-button" onClick={handleShopNow}>
                            Khám Phá Ngay
                        </button>
                    </div>

                    <div className="hero-image-container">
                        <div className="hero-image-wrapper">
                            {/* Image Carousel */}
                            <div className="hero-carousel">
                                {heroImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.src}
                                        alt={image.alt}
                                        className={`hero-image ${
                                            index === currentSlide ? 'active' : ''
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Navigation arrows */}
                            <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                            </button>
                            <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="9,18 15,12 9,6"></polyline>
                                </svg>
                            </button>

                            {/* Slide indicators */}
                            <div className="carousel-indicators">
                                {heroImages.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`indicator ${
                                            index === currentSlide ? 'active' : ''
                                        }`}
                                        onClick={() => goToSlide(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="hero-decoration hero-decoration-1"></div>
                        <div className="hero-decoration hero-decoration-2"></div>
                        <div className="hero-decoration hero-decoration-3"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
