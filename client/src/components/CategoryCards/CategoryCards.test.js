import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CategoryCards from '../CategoryCards';

// Mock useTranslation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, defaultValue) => defaultValue || key,
    }),
}));

// Mock dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
}));

// Mock store with categories state
const createMockStore = (state) => {
    return createStore(() => ({
        categories: {
            featuredCategories: [],
            featuredLoading: false,
            error: null,
            ...state,
        },
    }));
};

const renderCategoryCards = (storeState = {}) => {
    const store = createMockStore(storeState);
    return render(
        <Provider store={store}>
            <BrowserRouter>
                <CategoryCards />
            </BrowserRouter>
        </Provider>,
    );
};

describe('CategoryCards Component', () => {
    const mockCategories = [
        {
            id: '1',
            name: 'Dog Food',
            slug: 'dog-food',
            description: 'Premium dog food products',
            productCount: 25,
        },
        {
            id: '2',
            name: 'Cat Toys',
            slug: 'cat-toys',
            description: 'Fun toys for cats',
            productCount: 15,
        },
    ];

    beforeEach(() => {
        mockDispatch.mockClear();
    });

    test('dispatches getFeaturedCategories on mount', () => {
        renderCategoryCards();
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });

    test('shows loading state', () => {
        renderCategoryCards({ featuredLoading: true });
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('shows error message when there is an error', () => {
        renderCategoryCards({ error: 'Failed to load categories' });
        expect(
            screen.getByText('Không thể tải danh mục. Vui lòng thử lại sau.'),
        ).toBeInTheDocument();
    });

    test('renders categories correctly', () => {
        renderCategoryCards({ featuredCategories: mockCategories });

        expect(screen.getByText('Dog Food')).toBeInTheDocument();
        expect(screen.getByText('Cat Toys')).toBeInTheDocument();
        expect(screen.getByText('Premium dog food products')).toBeInTheDocument();
        expect(screen.getByText('Fun toys for cats')).toBeInTheDocument();
        expect(screen.getByText('25 sản phẩm')).toBeInTheDocument();
        expect(screen.getByText('15 sản phẩm')).toBeInTheDocument();
    });

    test('renders category links with correct href', () => {
        renderCategoryCards({ featuredCategories: mockCategories });

        const dogFoodLink = screen.getByRole('link', { name: /dog food/i });
        const catToysLink = screen.getByRole('link', { name: /cat toys/i });

        expect(dogFoodLink).toHaveAttribute('href', '/category/dog-food');
        expect(catToysLink).toHaveAttribute('href', '/category/cat-toys');
    });

    test('displays appropriate icons for different category slugs', () => {
        const categoriesWithIcons = [
            { ...mockCategories[0], slug: 'dry-dog-food' },
            { ...mockCategories[1], slug: 'cat-toys' },
        ];

        renderCategoryCards({ featuredCategories: categoriesWithIcons });

        expect(screen.getByText('🥘')).toBeInTheDocument(); // Dog food icon
        expect(screen.getByText('🧸')).toBeInTheDocument(); // Cat toys icon
    });
});
