import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../../../store/actions/cartActions';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { formatPrice } from '../../../utils/displayUtils';
import './VariantSelectionModal.css';

const VariantSelectionModal = ({ product, onClose, onBuyNow }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    // State for variant selection
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [availableOptions, setAvailableOptions] = useState({});
    const [currentCombination, setCurrentCombination] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
    const [currentStock, setCurrentStock] = useState(product?.stockQuantity || 0);
    const [isLoading, setIsLoading] = useState(false);

    // Check if product has the new variant system
    const hasNewVariantSystem = product?.variantAttributes && product.variantAttributes.length > 0;
    const hasLegacyVariants = product?.variants && product.variants.length > 0;
    const hasVariants = hasNewVariantSystem || hasLegacyVariants;

    // Calculate available options based on current selections
    const calculateAvailableOptions = useCallback(
        (selections = {}) => {
            if (!hasNewVariantSystem || !product?.variantAttributes) return {};

            const options = {};

            product.variantAttributes.forEach((attribute) => {
                const attributeName = attribute.name;
                const availableValues = [];

                attribute.values.forEach((value) => {
                    if (!value.isActive) return;

                    const testSelections = { ...selections, [attributeName]: value.value };

                    const hasCompatibleCombination = product.variantCombinations?.some(
                        (combination) => {
                            if (!combination.isActive) return false;

                            return combination.attributes.every((attr) => {
                                const selectedValue = testSelections[attr.attributeName];
                                return !selectedValue || selectedValue === attr.attributeValue;
                            });
                        },
                    );

                    if (hasCompatibleCombination) {
                        availableValues.push({
                            value: value.value,
                            displayName: value.displayName,
                            colorCode: value.colorCode,
                        });
                    }
                });

                options[attributeName] = availableValues;
            });

            return options;
        },
        [hasNewVariantSystem, product?.variantAttributes, product?.variantCombinations],
    );

    // Find combination details
    const findCombinationDetails = useCallback(
        (attributes) => {
            if (
                !hasNewVariantSystem ||
                !product?.variantCombinations ||
                Object.keys(attributes).length === 0
            ) {
                setCurrentCombination(null);
                return null;
            }

            const combination = product.variantCombinations.find((combo) => {
                if (!combo.isActive) return false;
                return combo.attributes.every((attr) => {
                    const selectedValue = attributes[attr.attributeName];
                    return selectedValue === attr.attributeValue;
                });
            });

            if (combination) {
                setCurrentCombination(combination);
                setCurrentPrice(
                    combination.salePrice ||
                        combination.price ||
                        product.salePrice ||
                        product.price,
                );
                setCurrentStock(combination.stockQuantity || 0);
            } else {
                setCurrentCombination(null);
                setCurrentPrice(product.salePrice || product.price);
                setCurrentStock(product.stockQuantity || 0);
            }

            return combination;
        },
        [hasNewVariantSystem, product],
    );

    // Initialize available options
    useEffect(() => {
        if (hasNewVariantSystem) {
            const options = calculateAvailableOptions(selectedAttributes);
            setAvailableOptions(options);
        }
    }, [calculateAvailableOptions, selectedAttributes, hasNewVariantSystem]);

    // Handle attribute selection
    const handleAttributeSelection = (attributeName, value) => {
        const newSelections = { ...selectedAttributes, [attributeName]: value };
        setSelectedAttributes(newSelections);

        if (hasNewVariantSystem) {
            findCombinationDetails(newSelections);
        }
    };

    // Check if all required attributes are selected
    const areAllRequiredAttributesSelected = () => {
        if (!hasNewVariantSystem) return true;

        const requiredAttributes =
            product.variantAttributes?.filter((attr) => attr.isRequired) || [];
        return requiredAttributes.every((attr) => selectedAttributes[attr.name]);
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= currentStock) {
            setQuantity(newQuantity);
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!areAllRequiredAttributesSelected()) {
            showErrorToast(
                t('product.selectVariantsFirst', 'Please select all required options first'),
            );
            return;
        }

        setIsLoading(true);
        try {
            let variantId = null;
            let variantDisplayName = '';
            let selectedVariants = null;

            if (hasNewVariantSystem && currentCombination) {
                variantId = currentCombination.sku;
                variantDisplayName = currentCombination.attributes
                    .map((attr) => `${attr.attributeName}: ${attr.attributeValue}`)
                    .join(', ');

                // Create selectedVariants object with enhanced information
                selectedVariants = {
                    variantId: currentCombination.sku,
                    attributes: currentCombination.attributes.map((attr) => {
                        const attrDef = product.variantAttributes.find(
                            (va) => va.name === attr.attributeName,
                        );
                        const valueDef = attrDef?.values.find(
                            (v) => v.value === attr.attributeValue,
                        );
                        return {
                            attributeName: attr.attributeName,
                            attributeDisplayName: attrDef?.displayName,
                            attributeValue: attr.attributeValue,
                            valueDisplayName: valueDef?.displayName,
                            colorCode: valueDef?.colorCode,
                        };
                    }),
                    combinationKey: currentCombination.combinationKey,
                    images: currentCombination.images || [],
                    price: currentPrice,
                };
            }

            const productData = {
                name: product.name,
                price: currentPrice,
                image: product.images?.[0] || '/placeholder-image.svg',
                ...(variantDisplayName && {
                    variant: {
                        id: variantId,
                        displayName: variantDisplayName,
                        price: currentPrice,
                    },
                }),
            };

            await dispatch(
                addToCart(product.id, quantity, productData, variantId, selectedVariants),
            );

            const variantText = variantDisplayName ? ` (${variantDisplayName})` : '';
            showSuccessToast(
                t('productCard.addedToCart', 'Added to cart successfully!') + variantText,
            );

            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            showErrorToast(
                t('productCard.addToCartError', 'Failed to add to cart. Please try again.'),
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle buy now
    const handleBuyNowClick = async () => {
        if (!areAllRequiredAttributesSelected()) {
            showErrorToast(
                t('product.selectVariantsFirst', 'Please select all required options first'),
            );
            return;
        }

        await handleAddToCart();
        if (onBuyNow) {
            onBuyNow();
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content variant-selection-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{t('product.selectOptions', 'Select Options')}</h3>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label={t('common.close', 'Close')}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Product Info */}
                    <div className="product-info">
                        <div className="product-image">
                            <img
                                src={product.images?.[0] || '/placeholder-image.svg'}
                                alt={product.name}
                                loading="lazy"
                            />
                        </div>
                        <div className="product-details">
                            <h4 className="product-name">{product.name}</h4>
                            <div className="product-price">{formatPrice(currentPrice)}</div>
                            <div className="product-stock">
                                {currentStock > 0 ? (
                                    <span className="in-stock">
                                        {t('product.inStock', 'In Stock')} ({currentStock}{' '}
                                        {t('product.available', 'available')})
                                    </span>
                                ) : (
                                    <span className="out-of-stock">
                                        {t('product.outOfStock', 'Out of Stock')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Variant Selection */}
                    {hasNewVariantSystem && (
                        <div className="variant-selection">
                            {product.variantAttributes.map((attribute) => (
                                <div key={attribute.name} className="attribute-group">
                                    <label className="attribute-label">
                                        {attribute.displayName}
                                        {attribute.isRequired && (
                                            <span className="required">*</span>
                                        )}
                                    </label>
                                    <div className="attribute-options">
                                        {availableOptions[attribute.name]?.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`attribute-option ${
                                                    selectedAttributes[attribute.name] ===
                                                    option.value
                                                        ? 'selected'
                                                        : ''
                                                } ${option.colorCode ? 'color-option' : ''}`}
                                                onClick={() =>
                                                    handleAttributeSelection(
                                                        attribute.name,
                                                        option.value,
                                                    )
                                                }
                                                style={
                                                    option.colorCode
                                                        ? { backgroundColor: option.colorCode }
                                                        : {}
                                                }
                                                title={option.displayName}
                                            >
                                                {option.colorCode ? '' : option.displayName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quantity Selection */}
                    <div className="quantity-selection">
                        <label className="quantity-label">
                            {t('product.quantity', 'Quantity')}
                        </label>
                        <div className="quantity-controls">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                    handleQuantityChange(parseInt(e.target.value) || 1)
                                }
                                min="1"
                                max={currentStock}
                                className="quantity-input"
                            />
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= currentStock}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={
                            isLoading || currentStock <= 0 || !areAllRequiredAttributesSelected()
                        }
                        className="btn btn-primary add-to-cart-btn"
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <svg
                                    className="cart-icon"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.59H6.5" />
                                </svg>
                                {t('products.addToCart', 'Add to Cart')}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleBuyNowClick}
                        disabled={
                            isLoading || currentStock <= 0 || !areAllRequiredAttributesSelected()
                        }
                        className="btn btn-accent buy-now-btn"
                    >
                        {t('product.buyNow', 'Buy Now')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantSelectionModal;
