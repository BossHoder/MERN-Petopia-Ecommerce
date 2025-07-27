import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const ImageGallery = ({ images = [], selectedIndex = 0, onImageSelect, productName = '' }) => {
    const { t } = useI18n();
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const mainImageRef = useRef(null);
    const thumbnailsRef = useRef(null);

    // Navigate to previous image
    const handlePrevious = useCallback(() => {
        const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
        onImageSelect(newIndex);
    }, [selectedIndex, images.length, onImageSelect]);

    // Navigate to next image
    const handleNext = useCallback(() => {
        const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
        onImageSelect(newIndex);
    }, [selectedIndex, images.length, onImageSelect]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'Escape') {
                setIsZoomed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, images.length, handlePrevious, handleNext]);

    // Handle mouse move for zoom
    const handleMouseMove = (e) => {
        if (!isZoomed || !mainImageRef.current) return;

        const rect = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    };

    // Handle zoom toggle
    const handleZoomToggle = () => {
        setIsZoomed(!isZoomed);
    };

    // Get image URL
    const getImageUrl = (image) => {
        if (typeof image === 'string') {
            return image.startsWith('http')
                ? image
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image}`;
        }
        return image?.url || image?.preview || '/placeholder-image.svg';
    };

    // Handle thumbnail scroll
    const scrollThumbnails = (direction) => {
        if (!thumbnailsRef.current) return;

        const scrollAmount = 120; // Width of thumbnail + gap
        const currentScroll = thumbnailsRef.current.scrollLeft;
        const newScroll =
            direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

        thumbnailsRef.current.scrollTo({
            left: newScroll,
            behavior: 'smooth',
        });
    };

    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className="image-gallery">
                <div className="main-image-container">
                    <img
                        src="/placeholder-image.svg"
                        alt={productName || t('product.noImage', 'No image available')}
                        className="main-image"
                    />
                </div>
            </div>
        );
    }

    const currentImage = images[selectedIndex];

    return (
        <div className="image-gallery">
            {/* Main Image */}
            <div className="main-image-container">
                <img
                    ref={mainImageRef}
                    src={getImageUrl(currentImage)}
                    alt={`${productName} - ${selectedIndex + 1}`}
                    className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                    style={
                        isZoomed
                            ? {
                                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                              }
                            : {}
                    }
                    onMouseMove={handleMouseMove}
                    onClick={handleZoomToggle}
                    onError={(e) => {
                        e.target.src = '/placeholder-image.svg';
                    }}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            className="nav-arrow nav-arrow-left"
                            onClick={handlePrevious}
                            aria-label={t('product.previousImage', 'Previous image')}
                        >
                            ←
                        </button>
                        <button
                            className="nav-arrow nav-arrow-right"
                            onClick={handleNext}
                            aria-label={t('product.nextImage', 'Next image')}
                        >
                            →
                        </button>
                    </>
                )}

                {/* Zoom Indicator */}
                <div className="zoom-indicator">
                    <button
                        className={`zoom-btn ${isZoomed ? 'active' : ''}`}
                        onClick={handleZoomToggle}
                        title={
                            isZoomed
                                ? t('product.zoomOut', 'Zoom out')
                                : t('product.zoomIn', 'Zoom in')
                        }
                    >
                        {isZoomed ? '🔍-' : '🔍+'}
                    </button>
                </div>

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="image-counter">
                        {selectedIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="thumbnails-container">
                    {images.length > 4 && (
                        <button
                            className="thumbnail-scroll-btn scroll-left"
                            onClick={() => scrollThumbnails('left')}
                            aria-label={t('product.scrollLeft', 'Scroll left')}
                        >
                            ←
                        </button>
                    )}

                    <div className="thumbnails-wrapper" ref={thumbnailsRef}>
                        <div className="thumbnails-list">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${
                                        index === selectedIndex ? 'active' : ''
                                    }`}
                                    onClick={() => onImageSelect(index)}
                                    aria-label={`${t('product.viewImage', 'View image')} ${
                                        index + 1
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`${productName} thumbnail ${index + 1}`}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.svg';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {images.length > 4 && (
                        <button
                            className="thumbnail-scroll-btn scroll-right"
                            onClick={() => scrollThumbnails('right')}
                            aria-label={t('product.scrollRight', 'Scroll right')}
                        >
                            →
                        </button>
                    )}
                </div>
            )}

            {/* Zoom Instructions */}
            {isZoomed && (
                <div className="zoom-instructions">
                    <p>
                        {t(
                            'product.zoomInstructions',
                            'Move mouse to pan • Click to zoom out • Press ESC to exit',
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
