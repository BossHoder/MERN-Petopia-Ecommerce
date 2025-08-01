import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useI18n } from '../../hooks/useI18n';
import ImageGallery from '../../components/ProductDetail/ImageGallery';
import VariantSelector from '../../components/ProductDetail/VariantSelector';
import EnhancedVariantSelector from '../../components/ProductDetail/EnhancedVariantSelector';
import ProductInfo from '../../components/ProductDetail/ProductInfo';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { getProductBySlug } from '../../store/actions/productActions';
import { addToCart } from '../../store/actions/cartActions';
import { renderValue } from '../../utils/displayUtils';
import './styles.css';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useI18n();

    // Redux state
    const { currentProduct: product, loading, error } = useSelector((state) => state.products);

    // Local state
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedVariantCombination, setSelectedVariantCombination] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [currentStock, setCurrentStock] = useState(0);
    const [currentImages, setCurrentImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Fetch product data on component mount or slug change
    useEffect(() => {
        if (slug) {
            dispatch(getProductBySlug(slug));
        }
    }, [dispatch, slug]);

    // Initialize price and stock when product loads
    useEffect(() => {
        if (product) {
            setCurrentPrice(product.salePrice || product.price);
            setCurrentStock(product.stockQuantity || 0);
        }
    }, [product]);

    // Update images when product or selected variant changes
    useEffect(() => {
        if (product) {
            console.log('🔍 Product Debug:', {
                hasVariants: !!(product.variants && product.variants.length > 0),
                variantsCount: product.variants?.length || 0,
                variants: product.variants,
                selectedVariant,
                productImages: product.images,
            });

            // Determine which images to show
            let imagesToShow = [];

            if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
                // Use variant-specific images
                imagesToShow = selectedVariant.images;
            } else if (product.images && product.images.length > 0) {
                // Fall back to main product images
                imagesToShow = product.images;
            }

            console.log('🖼️ ProductDetail setting currentImages:', imagesToShow);
            setCurrentImages(imagesToShow);
            setSelectedImageIndex(0); // Reset to first image when images change
        }
    }, [product, selectedVariant]);

    // Handle variant selection (legacy system)
    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity when variant changes
    };

    // Handle enhanced variant selection
    const handleEnhancedVariantChange = (combination) => {
        setSelectedVariantCombination(combination);
        setQuantity(1); // Reset quantity when variant changes
    };

    // Handle price change from enhanced variant selector
    const handlePriceChange = (price) => {
        setCurrentPrice(price);
    };

    // Handle stock change from enhanced variant selector
    const handleStockChange = (stock) => {
        setCurrentStock(stock);
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity) => {
        const maxStock = selectedVariant
            ? selectedVariant.stockQuantity || selectedVariant.stock || 0
            : product?.stockQuantity || 0;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!product) return;

        try {
            // Check if product has new variant system
            const hasNewVariantSystem =
                product.variantAttributes && product.variantAttributes.length > 0;

            let variantId = null;
            let variantDisplayName = '';

            if (hasNewVariantSystem) {
                // New variant system - check if all required attributes are selected
                if (!selectedVariantCombination) {
                    toast.error(
                        t(
                            'product.selectVariantsFirst',
                            'Please select all required options first',
                        ),
                    );
                    return;
                }

                variantId = selectedVariantCombination.sku;
                variantDisplayName = selectedVariantCombination.attributes
                    .map((attr) => `${attr.attributeName}: ${attr.attributeValue}`)
                    .join(', ');
            } else if (selectedVariant) {
                // Legacy variant system
                variantId = selectedVariant.id || selectedVariant.sku;
                variantDisplayName = `${selectedVariant.name}: ${selectedVariant.value}`;
            }

            // Prepare minimal product data for cart (only for guest users)
            const productData = {
                name: product.name,
                price: currentPrice,
                image: currentImages[0] || '/placeholder-image.svg',
                // Include variant information if selected
                ...(variantDisplayName && {
                    variant: {
                        id: variantId,
                        displayName: variantDisplayName,
                        price: currentPrice,
                    },
                }),
            };

            // Get product ID (use id field from server DTO)
            const productId = product.id;

            console.log('🛒 Using productId:', productId);
            console.log('🛒 Using variantId:', variantId);
            console.log('🛒 ProductDetail - Adding to cart:', {
                productId,
                variantId,
                quantity,
                productData,
                selectedVariant,
            });

            // Dispatch add to cart action with variant information
            await dispatch(addToCart(productId, quantity, productData, variantId));

            // Show success message with variant info
            const variantText = variantDisplayName ? ` (${variantDisplayName})` : '';
            toast.success(t('product.addedToCart', 'Added to cart successfully!') + variantText);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(t('product.addToCartError', 'Failed to add to cart. Please try again.'));
        }
    };

    // Handle buy now
    const handleBuyNow = async () => {
        try {
            await handleAddToCart();
            navigate('/checkout');
        } catch (error) {
            console.error('Error in buy now:', error);
            // Don't navigate if adding to cart failed
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="product-detail-loading">
                <LoadingSpinner size="large" />
                <p>{t('product.loading', 'Loading product...')}</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="product-detail-error">
                <ErrorMessage
                    message={error.message || t('product.notFound', 'Product not found')}
                    onRetry={() => dispatch(getProductBySlug(slug))}
                />
            </div>
        );
    }

    // Product not found
    if (!product) {
        return (
            <div className="product-detail-not-found">
                <h1>{t('product.notFound', 'Product not found')}</h1>
                <p>
                    {t('product.notFoundDesc', 'The product you are looking for does not exist.')}
                </p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    {t('common.backToHome', 'Back to Home')}
                </button>
            </div>
        );
    }

    // Calculate current values based on variant selection
    const isInStock = currentStock > 0;

    // Get current attributes (just use product attributes)
    const getCurrentAttributes = () => {
        return product.attributes || {};
    };

    const currentAttributes = getCurrentAttributes();

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{product.name} | Petopia</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description} />
                <meta property="og:image" content={currentImages[0] || '/placeholder-image.svg'} />
                <meta
                    property="og:url"
                    content={`${window.location.origin}/product/${product.slug}`}
                />
                <meta property="product:price:amount" content={currentPrice} />
                <meta property="product:price:currency" content="USD" />
                <link rel="canonical" href={`${window.location.origin}/product/${product.slug}`} />
            </Helmet>

            <div className="product-detail">
                <div className="container">
                    <div className="product-detail-content">
                        {/* Image Gallery */}
                        <div className="product-detail-gallery">
                            <ImageGallery
                                images={currentImages}
                                selectedIndex={selectedImageIndex}
                                onImageSelect={setSelectedImageIndex}
                                productName={product.name}
                                selectedVariant={selectedVariant}
                                productImages={product.images || []}
                            />
                        </div>

                        {/* Product Information */}
                        <div className="product-detail-info">
                            <ProductInfo
                                product={product}
                                selectedVariant={selectedVariant}
                                currentPrice={currentPrice}
                                currentStock={currentStock}
                                isInStock={isInStock}
                                quantity={quantity}
                                onQuantityChange={handleQuantityChange}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                            />

                            {/* Enhanced Variant Selector (New System) */}
                            {product.variantAttributes && product.variantAttributes.length > 0 && (
                                <div className="product-detail-variants">
                                    <EnhancedVariantSelector
                                        product={product}
                                        onVariantChange={handleEnhancedVariantChange}
                                        onPriceChange={handlePriceChange}
                                        onStockChange={handleStockChange}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* Legacy Variant Selector */}
                            {!product.variantAttributes &&
                                product.variants &&
                                product.variants.length > 0 && (
                                    <div className="product-detail-variants">
                                        <VariantSelector
                                            variants={product.variants}
                                            selectedVariant={selectedVariant}
                                            onVariantChange={handleVariantChange}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="product-detail-description">
                        <h2>{t('product.description', 'Description')}</h2>
                        <div className="product-description-content">{product.description}</div>
                    </div>

                    {/* Product Attributes */}
                    {currentAttributes && Object.keys(currentAttributes).length > 0 && (
                        <div className="product-detail-attributes">
                            <h2>{t('product.specifications', 'Specifications')}</h2>
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
            </div>
        </>
    );
};

export default ProductDetail;
