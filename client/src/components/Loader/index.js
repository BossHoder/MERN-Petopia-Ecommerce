// Export the main Loader component
export { default } from './Loader';
export { default as Loader } from './Loader';

// Export the demo component for development/testing
export { default as LoaderDemo } from './LoaderDemo';

// Export usage examples for documentation
export const LoaderExamples = {
    // Basic usage
    basic: '<Loader />',

    // Only paws variant
    pawPrints: '<Loader />',

    // Different sizes
    small: '<Loader size="sm" />',
    medium: '<Loader size="md" />',
    large: '<Loader size="lg" />',

    // Different colors
    orange: '<Loader color="orange" />',
    brown: '<Loader color="brown" />',
    cream: '<Loader color="cream" />',

    // Custom message
    customMessage: '<Loader message="Loading your pet supplies..." />',

    // Full-screen overlay
    overlay: '<Loader overlay={true} />',

    // Complete example
    complete: `<Loader 
  size="lg"
  color="orange"
  message="Finding the perfect products for your furry friend..."
  overlay={true}
/>`,

    // Profile page usage
    profilePage: '<Loader size="md" message="Loading your profile..." />',

    // Product loading
    productLoading: '<Loader size="sm" message="Fetching product details..." />',

    // Cart operations
    cartLoading: '<Loader color="brown" message="Updating your cart..." />',

    // Checkout process
    checkoutLoading: '<Loader size="lg" message="Processing your order..." overlay={true} />',
};

// Usage documentation
export const LoaderDocumentation = {
    description:
        'Pet-themed paws loader component with adorable walking paw prints animation and accessibility features',

    props: {
        size: {
            type: 'string',
            default: 'md',
            options: ['sm', 'md', 'lg'],
            description: 'Size of the loader animation',
        },
        message: {
            type: 'string',
            default: 'Loading...',
            description: 'Custom loading message to display',
        },
        overlay: {
            type: 'boolean',
            default: false,
            description: 'Whether to show as full-screen overlay',
        },
        color: {
            type: 'string',
            default: 'orange',
            options: ['orange', 'brown', 'cream'],
            description: 'Color theme for the loader',
        },
    },

    accessibility: {
        features: [
            'WCAG 2.1 AA compliant',
            'Screen reader support with aria-live and role attributes',
            'Reduced motion support for users with vestibular disorders',
            'High contrast mode support',
            'Keyboard navigation friendly',
            'Semantic HTML structure',
        ],
    },

    animation: 'Adorable walking paw prints with staggered animation and pet-friendly styling',

    bestPractices: [
        'Always provide meaningful loading messages',
        'Use overlay for full-page loading states',
        'Consider reduced motion preferences',
        'Choose appropriate size for the context',
        'Use color themes consistently with your design',
    ],
};
