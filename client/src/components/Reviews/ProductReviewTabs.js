import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getProductReviews } from '../../store/actions/reviewActions';
import ReviewList from './ReviewList';
import { renderValue } from '../../utils/displayUtils';
import './ProductReviewTabs.css';

const ProductReviewTabs = ({ product }) => {
    const { t } = useTranslation('common');
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('description');

    // Get reviews from Redux state
    const { reviews } = useSelector((state) => state.reviewList);

    // Load reviews when component mounts or product changes
    useEffect(() => {
        if (product?.id || product?._id) {
            dispatch(getProductReviews(product.id || product._id));
        }
    }, [dispatch, product?.id, product?._id]);

    const tabs = [
        {
            id: 'description',
            label: t('product.description', 'Mô tả'),
            icon: 'fas fa-file-text',
        },
        {
            id: 'reviews',
            label: t('product.reviews', 'Đánh giá'),
            icon: 'fas fa-star',
            count: reviews?.length || 0,
        },
    ];

    // Get current attributes
    const currentAttributes = product?.attributes || {};
    const hasAttributes = Object.keys(currentAttributes).length > 0;

    return (
        <div className="product-review-tabs">
            {/* Tab Navigation */}
            <div className="tab-navigation">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={tab.icon}></i>
                        <span className="tab-label">{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className="tab-count">({tab.count})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'description' && (
                    <div className="description-tab">
                        {/* Product Description */}
                        <div className="product-description-section">
                            <h3>{t('product.description', 'Mô tả sản phẩm')}</h3>
                            <div className="product-description-content">
                                {product?.description ||
                                    t('product.noDescription', 'Chưa có mô tả')}
                            </div>
                        </div>

                        {/* Product Attributes/Specifications */}
                        {hasAttributes && (
                            <div className="product-attributes-section">
                                <h3>{t('product.specifications', 'Thông số kỹ thuật')}</h3>
                                <div className="product-attributes-grid">
                                    {Object.entries(currentAttributes).map(([key, value]) => (
                                        <div key={key} className="product-attribute-item">
                                            <span className="attribute-label">{key}:</span>
                                            <span className="attribute-value">
                                                {renderValue(value, key)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="reviews-tab">
                        <ReviewList productId={product?.id || product?._id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviewTabs;
