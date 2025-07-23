import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from '../../store/actions/productActions';
import { getProductReviews, addProductReview } from '../../store/actions/reviewActions';
import { addToCart } from '../../store/actions/cartActions';
import { ADD_REVIEW_RESET } from '../../store/types';
import Loader from '../../components/Loader/Loader';
import Message from '../../components/Message/Message';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id: productId } = useParams();
    const dispatch = useDispatch();

    // State for cart quantity and review form
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

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
        dispatch(addToCart(productId, quantity));
        alert('Product added to cart!');
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
                <Message type="error">{productError}</Message>
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
                                        {product.ratings} stars ({product.numReviews} reviews)
                                    </span>
                                </div>
                                <p className="product-price">${product.price.toFixed(2)}</p>
                                <p className="product-description">{product.description}</p>
                            </div>
                            {/* Action Panel */}
                            <div className="product-action-panel">
                                <div className="action-row">
                                    <span>Price:</span> <strong>${product.price.toFixed(2)}</strong>
                                </div>
                                <div className="action-row">
                                    <span>Status:</span>{' '}
                                    <span>
                                        {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                {product.stockQuantity > 0 && (
                                    <div className="action-row">
                                        <span>Qty:</span>
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
                                    Add To Cart
                                </button>
                            </div>
                        </div>

                        {/* --- Product Reviews Section --- */}
                        <div className="product-reviews-section">
                            <h2>Reviews</h2>
                            {reviewsLoading ? (
                                <Loader />
                            ) : reviewsError ? (
                                <Message type="error">{reviewsError}</Message>
                            ) : reviews.length === 0 ? (
                                <Message>No reviews yet.</Message>
                            ) : (
                                <ul className="reviews-list">
                                    {reviews.map((review) => (
                                        <li key={review._id} className="review-item">
                                            <strong>{review.user.name}</strong>
                                            <div className="review-rating">
                                                {review.rating} stars
                                            </div>
                                            <p>
                                                <strong>{review.title}</strong>
                                            </p>
                                            <p>{review.comment}</p>
                                            <small>
                                                Reviewed on{' '}
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </small>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="add-review-form">
                                <h3>Write a Customer Review</h3>
                                {reviewAddLoading && <Loader />}
                                {reviewAddError && <Message type="error">{reviewAddError}</Message>}
                                {userInfo ? (
                                    <form onSubmit={submitReviewHandler}>
                                        <div className="form-group">
                                            <label>Rating</label>
                                            <select
                                                value={rating}
                                                onChange={(e) => setRating(Number(e.target.value))}
                                                required
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Poor</option>
                                                <option value="2">2 - Fair</option>
                                                <option value="3">3 - Good</option>
                                                <option value="4">4 - Very Good</option>
                                                <option value="5">5 - Excellent</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Comment</label>
                                            <textarea
                                                rows="4"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Submit Review
                                        </button>
                                    </form>
                                ) : (
                                    <Message>
                                        Please <Link to="/login">sign in</Link> to write a review.
                                    </Message>
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
