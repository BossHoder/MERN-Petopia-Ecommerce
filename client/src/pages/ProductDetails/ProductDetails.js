import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from '../../store/actions/productActions';
import { getProductReviews, addProductReview } from '../../store/actions/reviewActions';
import { addToCart } from '../../store/actions/cartActions';
import { ADD_REVIEW_RESET } from '../../store/types';
import Loader from '../../components/Loader/Loader';
import Notification from '../../components/Notification/Notification';
import { useTranslation } from 'react-i18next';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id: productId } = useParams();
    const dispatch = useDispatch();
    const { t } = useTranslation('common');

    // State for cart quantity and review form
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    // State for cart feedback
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [addToCartError, setAddToCartError] = useState('');

    // Selectors for various parts of the state
    const { userInfo } = useSelector((state) => state.auth);
    const {
        currentProduct: product,
        productLoading,
        error: productError,
    } = useSelector((state) => state.products);
    const {
        reviews,
        loading: reviewsLoading,
        error: reviewsError,
    } = useSelector((state) => state.reviewList);
    const {
        success: reviewSuccess,
        loading: reviewAddLoading,
        error: reviewAddError,
    } = useSelector((state) => state.reviewAdd);

    useEffect(() => {
        if (reviewSuccess) {
            alert('Review Submitted!');
            setRating(0);
            setTitle('');
            setComment('');
            dispatch({ type: ADD_REVIEW_RESET });
        }
        dispatch(getProductById(productId));
        dispatch(getProductReviews(productId));
    }, [dispatch, productId, reviewSuccess]);

    const addToCartHandler = () => {
        setAddToCartError('');
        setAddToCartSuccess(false);
        // Dispatch the action and handle success/error
        dispatch(addToCart(productId, quantity))
            .then(() => {
                setAddToCartSuccess(true);
                // Hide the success message after 3 seconds
                setTimeout(() => setAddToCartSuccess(false), 3000);
            })
            .catch((err) => {
                setAddToCartError(err);
                // Hide the error message after 3 seconds
                setTimeout(() => setAddToCartError(''), 3000);
            });
    };

    const submitReviewHandler = (e) => {
        e.preventDefault();
        dispatch(addProductReview(productId, { rating, title, comment }));
    };

    return (
        <div className="product-details-page">
            {productLoading ? (
                <Loader />
            ) : productError ? (
                <Notification type="error">{productError}</Notification>
            ) : (
                product && (
                    <>
                        {/* --- Product Main Info --- */}
                        <div className="product-main-layout">
                            {/* Image Gallery */}
                            <div className="product-image-gallery">
                                <img src={product.images[0]} alt={product.name} />
                            </div>
                            {/* Info Panel */}
                            <div className="product-info-panel">
                                <h1>{product.name}</h1>
                                <div className="product-rating">
                                    <span>
                                        {product.ratings} {t('productDetails.stars', 'stars')} (
                                        {product.numReviews}{' '}
                                        {t('productDetails.reviews', 'reviews')})
                                    </span>
                                </div>
                                <p className="product-price">${product.price.toFixed(2)}</p>
                                <p className="product-description">{product.description}</p>
                            </div>
                            {/* Action Panel */}
                            <div className="product-action-panel">
                                <div className="action-row">
                                    <span>{t('productDetails.price', 'Price')}:</span>{' '}
                                    <strong>${product.price.toFixed(2)}</strong>
                                </div>
                                <div className="action-row">
                                    <span>{t('productDetails.status', 'Status')}:</span>{' '}
                                    <span>
                                        {product.stockQuantity > 0
                                            ? t('productDetails.inStock', 'In Stock')
                                            : t('productDetails.outOfStock', 'Out of Stock')}
                                    </span>
                                </div>
                                {product.stockQuantity > 0 && (
                                    <div className="action-row">
                                        <span>{t('productDetails.qty', 'Qty')}:</span>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                        >
                                            {[
                                                ...Array(
                                                    Math.min(product.stockQuantity, 10),
                                                ).keys(),
                                            ].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={addToCartHandler}
                                    disabled={product.stockQuantity === 0}
                                >
                                    {t('productDetails.addToCart', 'Add To Cart')}
                                </button>
                                {addToCartError && (
                                    <Notification type="error">{addToCartError}</Notification>
                                )}
                            </div>
                        </div>

                        {/* --- Product Reviews Section --- */}
                        <div className="product-reviews-section">
                            <h2>{t('productDetails.reviewsTitle', 'Reviews')}</h2>
                            {reviewsLoading ? (
                                <Loader />
                            ) : reviewsError ? (
                                <Notification type="error">{reviewsError}</Notification>
                            ) : reviews.length === 0 ? (
                                <Notification>
                                    {t('productDetails.noReviews', 'No reviews yet.')}
                                </Notification>
                            ) : (
                                <ul className="reviews-list">
                                    {reviews.map((review) => (
                                        <li key={review._id} className="review-item">
                                            <strong>{review.user.name}</strong>
                                            <div className="review-rating">
                                                {review.rating} {t('productDetails.stars', 'stars')}
                                            </div>
                                            <p>
                                                <strong>{review.title}</strong>
                                            </p>
                                            <p>{review.comment}</p>
                                            <small>
                                                {t('productDetails.reviewedOn', 'Reviewed on')}{' '}
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </small>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="add-review-form">
                                <h3>
                                    {t(
                                        'productDetails.writeReviewTitle',
                                        'Write a Customer Review',
                                    )}
                                </h3>
                                {reviewAddLoading && <Loader />}
                                {reviewAddError && (
                                    <Notification type="error">{reviewAddError}</Notification>
                                )}
                                {userInfo ? (
                                    <form onSubmit={submitReviewHandler}>
                                        <div className="form-group">
                                            <label>{t('productDetails.rating', 'Rating')}</label>
                                            <select
                                                value={rating}
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                required
                                            >
                                                <option value="">
                                                    {t('productDetails.select', 'Select...')}
                                                </option>
                                                <option value="1">
                                                    {t('productDetails.ratings.poor', '1 - Poor')}
                                                </option>
                                                <option value="2">
                                                    {t('productDetails.ratings.fair', '2 - Fair')}
                                                </option>
                                                <option value="3">
                                                    {t('productDetails.ratings.good', '3 - Good')}
                                                </option>
                                                <option value="4">
                                                    {t(
                                                        'productDetails.ratings.veryGood',
                                                        '4 - Very Good',
                                                    )}
                                                </option>
                                                <option value="5">
                                                    {t(
                                                        'productDetails.ratings.excellent',
                                                        '5 - Excellent',
                                                    )}
                                                </option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>{t('productDetails.titleLabel', 'Title')}</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                {t('productDetails.commentLabel', 'Comment')}
                                            </label>
                                            <textarea
                                                rows="4"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            {t('productDetails.submitReview', 'Submit Review')}
                                        </button>
                                    </form>
                                ) : (
                                    <Notification>
                                        {t('productDetails.signInToReview', 'Please')}{' '}
                                        <Link to="/login">{t('navigation.login', 'sign in')}</Link>{' '}
                                        {t(
                                            'productDetails.signInToReviewSuffix',
                                            'to write a review.',
                                        )}
                                    </Notification>
                                )}
                            </div>
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default ProductDetails;
