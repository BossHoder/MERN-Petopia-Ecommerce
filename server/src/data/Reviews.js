import '../config/database.js';

// Sample review data for pet store products
const sampleReviews = [
    {
        product: null, // Will be populated during seeding with actual Product ObjectId
        user: null, // Will be populated during seeding with actual User ObjectId
        title: 'Great quality dog food!',
        comment:
            'My golden retriever loves this food. His coat is shinier and he has more energy since switching to this brand.',
        rating: 5,
        status: 'approved',
        helpfulVotes: 12,
        verifiedPurchase: true,
        order: null, // Will be populated if order exists
        images: [
            {
                url: 'https://example.com/images/review-dog-food-1.jpg',
                caption: 'My dog enjoying his meal',
            },
        ],
        productSku: 'DOG-FOOD-DRY-001', // Used to link during seeding
        username: 'john_doe', // Used to link during seeding
    },
    {
        product: null,
        user: null,
        title: 'Perfect for training',
        comment: 'These treats are the perfect size for training sessions. My puppy responds really well to them.',
        rating: 5,
        status: 'approved',
        helpfulVotes: 8,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'DOG-TREAT-001',
        username: 'jane_smith',
    },
    {
        product: null,
        user: null,
        title: 'Good value for money',
        comment: 'Decent quality rope toy. Lasted about 3 months with heavy use before showing wear.',
        rating: 4,
        status: 'approved',
        helpfulVotes: 3,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'DOG-TOY-001',
        username: 'pet_lover99',
    },
    {
        product: null,
        user: null,
        title: 'My cat is obsessed!',
        comment:
            'This catnip is amazing quality. My usually lazy cat becomes super playful whenever I give this to her.',
        rating: 5,
        status: 'approved',
        helpfulVotes: 15,
        verifiedPurchase: true,
        order: null,
        images: [
            {
                url: 'https://example.com/images/review-catnip-1.jpg',
                caption: 'Cat going crazy for catnip',
            },
        ],
        productSku: 'CAT-CATNIP-001',
        username: 'john_doe',
    },
    {
        product: null,
        user: null,
        title: 'Excellent interactive toy',
        comment: 'Keeps my indoor cat entertained for hours. The feathers are replaceable which is a nice touch.',
        rating: 5,
        status: 'approved',
        helpfulVotes: 6,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'CAT-TOY-001',
        username: 'jane_smith',
    },
    {
        product: null,
        user: null,
        title: 'Good but could be sturdier',
        comment:
            'The scratching post works well but wobbles a bit when my large cat uses it. Overall satisfied though.',
        rating: 4,
        status: 'approved',
        helpfulVotes: 4,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'CAT-SCRATCH-001',
        username: 'pet_lover99',
    },
    {
        product: null,
        user: null,
        title: 'Great for sensitive skin',
        comment: 'This shampoo is perfect for my dog with sensitive skin. No more itching after baths!',
        rating: 5,
        status: 'approved',
        helpfulVotes: 9,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'DOG-SHAM-001',
        username: 'admin',
    },
    {
        product: null,
        user: null,
        title: 'Cats love the taste',
        comment: 'Both my cats love this wet food. They finish their bowls completely every time.',
        rating: 5,
        status: 'approved',
        helpfulVotes: 7,
        verifiedPurchase: true,
        order: null,
        images: [],
        productSku: 'CAT-FOOD-WET-001',
        username: 'new_user',
    },
];

export default sampleReviews;
