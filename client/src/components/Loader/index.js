// Export the main Loader component
export { default } from './Loader';
export { default as Loader } from './Loader';

// Export the demo component for development/testing
export { default as LoaderDemo } from './LoaderDemo';

// Export usage examples for documentation
export const LoaderExamples = {
    // Basic usage
    basic: '<Loader />',
    
    // Different variants
    pawPrints: '<Loader variant="paws" />',
    beatingHeart: '<Loader variant="heart" />',
    spinningBone: '<Loader variant="bone" />',
    bouncingDots: '<Loader variant="dots" />',
    minimalRing: '<Loader variant="minimal" />',
    
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
  variant="paws"
  size="lg"
  color="orange"
  message="Finding the perfect products for your furry friend..."
  overlay={true}
/>`,
    
    // Profile page usage
    profilePage: '<Loader variant="heart" size="md" message="Loading your profile..." />',
    
    // Product loading
    productLoading: '<Loader variant="bone" size="sm" message="Fetching product details..." />',
    
    // Cart operations
    cartLoading: '<Loader variant="dots" color="brown" message="Updating your cart..." />',
    
    // Checkout process
    checkoutLoading: '<Loader variant="minimal" size="lg" message="Processing your order..." overlay={true} />',
};

// Usage documentation
export const LoaderDocumentation = {
    description: 'Enhanced pet-themed loader component with multiple animations and accessibility features',
    
    props: {
        variant: {
            type: 'string',
            default: 'paws',
            options: ['paws', 'heart', 'bone', 'minimal', 'dots'],
            description: 'The animation variant to display'
        },
        size: {
            type: 'string',
            default: 'md',
            options: ['sm', 'md', 'lg'],
            description: 'Size of the loader animation'
        },
        message: {
            type: 'string',
            default: 'Loading...',
            description: 'Custom loading message to display'
        },
        overlay: {
            type: 'boolean',
            default: false,
            description: 'Whether to show as full-screen overlay'
        },
        color: {
            type: 'string',
            default: 'orange',
            options: ['orange', 'brown', 'cream'],
            description: 'Color theme for the loader'
        }
    },
    
    accessibility: {
        features: [
            'WCAG 2.1 AA compliant',
            'Screen reader support with aria-live and role attributes',
            'Reduced motion support for users with vestibular disorders',
            'High contrast mode support',
            'Keyboard navigation friendly',
            'Semantic HTML structure'
        ]
    },
    
    animations: {
        paws: 'Adorable walking paw prints with staggered animation',
        heart: 'Loving heartbeat animation with scaling and glow effects',
        bone: 'Playful spinning bone with dynamic scaling',
        dots: 'Classic bouncing dots with smooth easing',
        minimal: 'Clean concentric rings with staggered rotation'
    },
    
    bestPractices: [
        'Use "paws" variant for general loading states',
        'Use "heart" variant for user-related operations',
        'Use "bone" variant for pet product operations',
        'Use "dots" variant for quick operations',
        'Use "minimal" variant for professional contexts',
        'Always provide meaningful loading messages',
        'Use overlay for full-page loading states',
        'Consider reduced motion preferences'
    ]
};
