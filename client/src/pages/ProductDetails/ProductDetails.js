import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    // State for cart quantity, review form, và variant selection
    const [quantity, setQuantity] = useState(1);
    // Lưu lựa chọn cho từng group (theo variant name)
    const [selectedVariantValues, setSelectedVariantValues] = useState({});
    const [activeVariant, setActiveVariant] = useState(null); // variant object đã chọn đủ
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    // State for cart feedback
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);
    const [addToCartError, setAddToCartError] = useState('');

    // Selectors for various parts of the state
    const { userInfo, isAuthenticated } = useSelector((state) => state.auth);
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

    // Khi chọn variant value, reset quantity về 1
    useEffect(() => {
        setQuantity(1);
    }, [activeVariant]);

    // Xử lý group variants
    let variantGroups = [];
    if (product && product.variants && product.variants.length > 0) {
        // Gom nhóm theo name
        const groupMap = {};
        product.variants.forEach((v) => {
            if (!groupMap[v.name]) groupMap[v.name] = new Set();
            groupMap[v.name].add(v.value);
        });
        variantGroups = Object.entries(groupMap).map(([name, values]) => ({
            name,
            values: Array.from(values),
        }));
    }

    // Khi user chọn đủ các group, xác định variant chính xác
    useEffect(() => {
        if (!product || !product.variants || product.variants.length === 0) {
            setActiveVariant(null);
            return;
        }
        // Tìm variant khớp với tất cả lựa chọn
        const keys = Object.keys(selectedVariantValues);
        if (keys.length !== variantGroups.length) {
            setActiveVariant(null);
            return;
        }
        const found = product.variants.find((v) =>
            variantGroups.every((g) =>
                v.name === g.name ? v.value === selectedVariantValues[g.name] : true,
            ),
        );
        setActiveVariant(found || null);
    }, [selectedVariantValues, product]);

    // Lấy giá, tồn kho theo variant nếu có
    const displayPrice = activeVariant ? activeVariant.price : product?.price;
    const displayStock = activeVariant ? activeVariant.stockQuantity : product?.stockQuantity;

    const addToCartHandler = () => {
        setAddToCartError('');
        setAddToCartSuccess(false);
        // Dispatch the action and handle success/error
        dispatch(addToCart(productId, quantity, product))
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

    // Xử lý click chọn/huỷ chọn variant value
    const handleVariantSelect = (groupName, value) => {
        setSelectedVariantValues((prev) => {
            // Nếu đã chọn value này thì huỷ chọn
            if (prev[groupName] === value) {
                const newObj = { ...prev };
                delete newObj[groupName];
                return newObj;
            }
            // Chọn value mới cho group
            return { ...prev, [groupName]: value };
        });
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
                                <p className="product-price">
                                    ${displayPrice ? displayPrice.toFixed(2) : '0.00'}
                                </p>
                                <p className="product-description">{product.description}</p>
                            </div>
                            {/* Action Panel */}
                            <div className="product-action-panel">
                                {/* Variants Grouped Buttons */}
                                {variantGroups.length > 0 && (
                                    <>
                                        {variantGroups.map((group) => (
                                            <div
                                                className="action-row"
                                                key={group.name}
                                                style={{
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <span style={{ fontWeight: 500, marginBottom: 4 }}>
                                                    {group.name}:
                                                </span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: 8,
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    {group.values.map((value) => {
                                                        const isActive =
                                                            selectedVariantValues[group.name] ===
                                                            value;
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={value}
                                                                className={`variant-square-btn${
                                                                    isActive ? ' active' : ''
                                                                }`}
                                                                onClick={() =>
                                                                    handleVariantSelect(
                                                                        group.name,
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                {value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <div className="action-row">
                                    <span>{t('productDetails.price', 'Price')}:</span>{' '}
                                    <strong>
                                        ${displayPrice ? displayPrice.toFixed(2) : '0.00'}
                                    </strong>
                                </div>
                                <div className="action-row">
                                    <span>{t('productDetails.status', 'Status')}:</span>{' '}
                                    <span>
                                        {displayStock > 0
                                            ? t('productDetails.inStock', 'In Stock')
                                            : t('productDetails.outOfStock', 'Out of Stock')}
                                    </span>
                                </div>
                                {displayStock > 0 && (
                                    <div className="action-row">
                                        <span>{t('productDetails.qty', 'Qty')}:</span>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-light"
                                                style={{ minWidth: 32 }}
                                                onClick={() =>
                                                    setQuantity((q) => Math.max(1, q - 1))
                                                }
                                                disabled={quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={displayStock}
                                                value={quantity}
                                                onChange={(e) => {
                                                    let val = Number(e.target.value);
                                                    if (isNaN(val)) val = 1;
                                                    val = Math.max(1, Math.min(displayStock, val));
                                                    setQuantity(val);
                                                }}
                                                className="quantity-input-no-spinner"
                                                style={{
                                                    width: 48,
                                                    textAlign: 'center',
                                                    appearance: 'none',
                                                    MozAppearance: 'textfield',
                                                    WebkitAppearance: 'none',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-light"
                                                style={{ minWidth: 32 }}
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.min(displayStock, q + 1),
                                                    )
                                                }
                                                disabled={quantity >= displayStock}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={addToCartHandler}
                                    disabled={
                                        displayStock === 0 ||
                                        (variantGroups.length > 0 &&
                                            (!activeVariant ||
                                                Object.keys(selectedVariantValues).length !==
                                                    variantGroups.length))
                                    }
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
