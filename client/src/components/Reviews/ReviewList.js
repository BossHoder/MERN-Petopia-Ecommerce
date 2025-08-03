import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getProductReviews } from '../../store/actions/reviewActions';
import ReviewItem from './ReviewItem';
import LoadingSpinner from '../Common/LoadingSpinner';
import './ReviewList.css';

const ReviewList = ({ productId }) => {
    const { t } = useTranslation('common');
    const dispatch = useDispatch();
    const { reviews, loading, error } = useSelector((state) => state.reviewList);

    useEffect(() => {
        if (productId) {
            dispatch(getProductReviews(productId));
        }
    }, [dispatch, productId]);

    if (loading) {
        return (
            <div className="review-list-loading">
                <LoadingSpinner size="medium" />
                <p>{t('reviews.loading', 'Đang tải đánh giá...')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-list-error">
                <p>{t('reviews.loadError', 'Không thể tải đánh giá. Vui lòng thử lại.')}</p>
                <button
                    className="btn-retry"
                    onClick={() => dispatch(getProductReviews(productId))}
                >
                    {t('common.retry', 'Thử lại')}
                </button>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>{t('reviews.noReviews', 'Chưa có đánh giá nào')}</h3>
                    <p>{t('reviews.beFirst', 'Hãy là người đầu tiên đánh giá sản phẩm này!')}</p>
                </div>
            </div>
        );
    }

    // Calculate rating statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingCounts = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    const StarRating = ({ rating, size = 'medium' }) => {
        return (
            <div className={`star-rating star-rating-${size}`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const RatingBar = ({ rating, count, total }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
            <div className="rating-bar-row">
                <span className="rating-number">{rating} ★</span>
                <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }} />
                </div>
                <span className="rating-count">({count})</span>
            </div>
        );
    };

    return (
        <div className="review-list">
            {/* Rating Summary */}
            <div className="rating-summary">
                <div className="overall-rating">
                    <div className="rating-score">
                        <span className="average-rating">{averageRating.toFixed(1)}</span>
                        <StarRating rating={Math.round(averageRating)} size="large" />
                        <p className="rating-text">
                            {t('reviews.basedOn', 'Dựa trên')} {totalReviews}{' '}
                            {t('reviews.reviews', 'đánh giá')}
                        </p>
                    </div>
                </div>

                <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <RatingBar
                            key={rating}
                            rating={rating}
                            count={ratingCounts[rating]}
                            total={totalReviews}
                        />
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-container">
                <h3 className="reviews-title">
                    {t('reviews.customerReviews', 'Đánh giá từ khách hàng')} ({totalReviews})
                </h3>

                <div className="reviews-list">
                    {reviews.map((review) => (
                        <ReviewItem key={review._id} review={review} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewList;
