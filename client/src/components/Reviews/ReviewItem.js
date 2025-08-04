import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import './ReviewItem.css';

const ReviewItem = ({ review }) => {
    const { t } = useTranslation('common');

    const StarRating = ({ rating }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="review-item">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="reviewer-avatar">
                        {review.user?.avatar ? (
                            <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="avatar-image"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {getInitials(review.user?.name)}
                            </div>
                        )}
                    </div>
                    <div className="reviewer-details">
                        <div className="reviewer-name-section">
                            <h4 className="reviewer-name">
                                {review.user?.name ||
                                    t('reviews.anonymousUser', 'Người dùng ẩn danh')}
                            </h4>
                            {review.verifiedPurchase && (
                                <span className="verified-badge">
                                    <i className="fas fa-check-circle"></i>
                                    {t('reviews.verifiedPurchase', 'Đã mua hàng')}
                                </span>
                            )}
                        </div>
                        <div className="review-meta">
                            <StarRating rating={review.rating} />
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="review-content">
                <h5 className="review-title">{review.title}</h5>
                <p className="review-comment">{review.comment}</p>
            </div>

            {review.helpfulVotes > 0 && (
                <div className="review-helpful">
                    <span className="helpful-count">
                        {review.helpfulVotes} {t('reviews.foundHelpful', 'người thấy hữu ích')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ReviewItem;
