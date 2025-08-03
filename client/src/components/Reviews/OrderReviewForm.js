import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { addProductReview } from '../../store/actions/reviewActions';
import './OrderReviewForm.css';

const OrderReviewForm = ({ orderItem, orderId, onReviewSubmitted }) => {
    const { t } = useTranslation('common');
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.reviewAdd);

    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
    });

    const [showForm, setShowForm] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRatingChange = (rating) => {
        setFormData((prev) => ({
            ...prev,
            rating,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.comment.trim()) {
            toast.error(t('reviews.fillAllFields', 'Vui lòng điền đầy đủ thông tin'));
            return;
        }

        try {
            const result = await dispatch(addProductReview(orderItem.product, formData));

            // Check if the action was successful
            if (result.type && !result.type.includes('FAIL')) {
                toast.success(t('reviews.submitSuccess', 'Đánh giá đã được gửi thành công!'));
                setFormData({ rating: 5, title: '', comment: '' });
                setShowForm(false);
                if (onReviewSubmitted) {
                    onReviewSubmitted(orderItem.product);
                }
            }
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error(t('reviews.submitError', 'Có lỗi khi gửi đánh giá. Vui lòng thử lại.'));
        }
    };

    const StarRating = ({ rating, onRatingChange, readonly = false }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star ${star <= rating ? 'filled' : ''}`}
                        onClick={() => !readonly && onRatingChange(star)}
                        disabled={readonly}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    if (!showForm) {
        return (
            <div className="order-review-item">
                <div className="review-item-info">
                    <img src={orderItem.image} alt={orderItem.name} className="review-item-image" />
                    <div className="review-item-details">
                        <h4>{orderItem.name}</h4>
                        <p className="review-item-price">
                            {orderItem.quantity} x{' '}
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(orderItem.price)}
                        </p>
                    </div>
                </div>
                <button className="btn-review-product" onClick={() => setShowForm(true)}>
                    {t('reviews.writeReview', 'Viết đánh giá')}
                </button>
            </div>
        );
    }

    return (
        <div className="order-review-form">
            <div className="review-product-info">
                <img src={orderItem.image} alt={orderItem.name} className="review-product-image" />
                <div className="review-product-details">
                    <h4>{orderItem.name}</h4>
                    <p className="review-product-price">
                        {orderItem.quantity} x{' '}
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(orderItem.price)}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>{t('reviews.rating', 'Đánh giá')}</label>
                    <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="title">{t('reviews.title', 'Tiêu đề đánh giá')} *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder={t('reviews.titlePlaceholder', 'Tóm tắt đánh giá của bạn')}
                        maxLength={100}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="comment">{t('reviews.comment', 'Nhận xét chi tiết')} *</label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        placeholder={t(
                            'reviews.commentPlaceholder',
                            'Chia sẻ trải nghiệm của bạn về sản phẩm này',
                        )}
                        rows={4}
                        maxLength={1000}
                        required
                    />
                    <small className="char-count">
                        {formData.comment.length}/1000 {t('reviews.characters', 'ký tự')}
                    </small>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                    >
                        {t('common.cancel', 'Hủy')}
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading
                            ? t('reviews.submitting', 'Đang gửi...')
                            : t('reviews.submit', 'Gửi đánh giá')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderReviewForm;
