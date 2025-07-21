import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ProductCard from '../ProductCard';

// Mock useTranslation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, defaultValue) => defaultValue || key,
    }),
}));

// Mock store
const mockStore = createStore(() => ({}));

const renderProductCard = (product) => {
    return render(
        <Provider store={mockStore}>
            <BrowserRouter>
                <ProductCard product={product} />
            </BrowserRouter>
        </Provider>,
    );
};

describe('ProductCard Component', () => {
    const mockProduct = {
        id: '1',
        name: 'Premium Dog Food',
        slug: 'premium-dog-food',
        price: 100000,
        salePrice: 80000,
        brand: 'PetNutrition',
        images: ['https://example.com/image.jpg'],
        category: { name: 'Dog Food' },
        ratings: 4.5,
        numReviews: 10,
        inStock: true,
        lowStock: false,
    };

    test('renders product information correctly', () => {
        renderProductCard(mockProduct);

        expect(screen.getByText('Premium Dog Food')).toBeInTheDocument();
        expect(screen.getByText('PetNutrition')).toBeInTheDocument();
        expect(screen.getByText('Dog Food')).toBeInTheDocument();
        expect(screen.getByText('(10)')).toBeInTheDocument();
    });

    test('displays sale price and original price when product is on sale', () => {
        renderProductCard(mockProduct);

        expect(screen.getByText('₫80,000')).toBeInTheDocument(); // Sale price
        expect(screen.getByText('₫100,000')).toBeInTheDocument(); // Original price
    });

    test('shows discount badge when product has sale price', () => {
        renderProductCard(mockProduct);

        expect(screen.getByText('-20%')).toBeInTheDocument();
    });

    test('disables add to cart button when out of stock', () => {
        const outOfStockProduct = { ...mockProduct, inStock: false };
        renderProductCard(outOfStockProduct);

        const addToCartBtn = screen.getByRole('button');
        expect(addToCartBtn).toBeDisabled();
        expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    });

    test('shows low stock warning when product has low stock', () => {
        const lowStockProduct = { ...mockProduct, lowStock: true };
        renderProductCard(lowStockProduct);

        expect(screen.getByText('Chỉ còn lại ít sản phẩm')).toBeInTheDocument();
    });

    test('calls add to cart function when button is clicked', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        renderProductCard(mockProduct);

        const addToCartBtn = screen.getByText('Thêm vào giỏ');
        fireEvent.click(addToCartBtn);

        expect(consoleSpy).toHaveBeenCalledWith('Add to cart:', '1');
        consoleSpy.mockRestore();
    });

    test('renders product link with correct href', () => {
        renderProductCard(mockProduct);

        const productLink = screen.getByRole('link');
        expect(productLink).toHaveAttribute('href', '/product/premium-dog-food');
    });
});
