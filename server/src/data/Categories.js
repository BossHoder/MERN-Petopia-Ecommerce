import mongoose from 'mongoose';

// ===========================================
// SAMPLE CATEGORIES DATA
// ===========================================
// Updated to match Category model schema requirements
// Note: parentCategory will be populated with actual ObjectIds during seeding

const sampleCategories = [
    // DOG CATEGORIES
    {
        name: 'Dry Dog Food',
        slug: 'dry-dog-food',
        // parentCategory will be set to Dog Supplies ObjectId during seeding
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dry-dog-food-icon.png',
        description: 'Premium dry food for dogs of all ages and sizes',
        isPublished: true,
        sortOrder: 1,
    },
    {
        name: 'Wet Dog Food',
        slug: 'wet-dog-food',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/wet-dog-food-icon.png',
        description: 'Nutritious wet food and canned meals for dogs',
        isPublished: true,
        sortOrder: 2,
    },
    {
        name: 'Dog Bones & Treats',
        slug: 'dog-bones-treats',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-bones-treats-icon.png',
        description: 'Healthy treats, bones and chews for training and rewards',
        isPublished: true,
        sortOrder: 3,
    },
    {
        name: 'Dog Vitamins & Supplements',
        slug: 'dog-vitamins-supplements',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-vitamins-supplements-icon.png',
        description: 'Health supplements and vitamins for optimal dog wellness',
        isPublished: true,
        sortOrder: 4,
    },
    {
        name: 'Dog Toys',
        slug: 'dog-toys',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-toys-icon.png',
        description: 'Interactive toys, balls and entertainment for dogs',
        isPublished: true,
        sortOrder: 5,
    },
    {
        name: 'Dog Collars & Leashes',
        slug: 'dog-collars-leashes',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-collars-leashes-icon.png',
        description: 'Collars, leashes, harnesses and walking accessories',
        isPublished: true,
        sortOrder: 6,
    },
    {
        name: 'Dog Clothing & Fashion Accessories',
        slug: 'dog-clothing-fashion-accessories',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-clothing-fashion-accessories-icon.png',
        description: 'Stylish clothing, costumes and fashion accessories for dogs',
        isPublished: true,
        sortOrder: 7,
    },

    // CAT CATEGORIES
    {
        name: 'Dry Cat Food',
        slug: 'dry-cat-food',
        parentCategory: null, // Will be populated by seed script (Cat Supplies)
        iconUrl: 'https://example.com/icons/dry-cat-food-icon.png',
        description: 'Premium dry kibble for cats of all life stages',
        isPublished: true,
        sortOrder: 8,
    },
    {
        name: 'Wet Cat Food',
        slug: 'wet-cat-food',
        parentCategory: null, // Will be populated by seed script (Cat Supplies)
        iconUrl: 'https://example.com/icons/wet-cat-food-icon.png',
        description: 'Delicious wet food and pate for cats',
        isPublished: true,
        sortOrder: 9,
    },
    {
        name: 'Cat Treats',
        slug: 'cat-treats',
        parentCategory: null, // Will be populated by seed script (Cat Supplies)
        iconUrl: 'https://example.com/icons/cat-treats-icon.png',
        description: 'Tasty treats and snacks for cats',
        isPublished: true,
        sortOrder: 10,
    },
    {
        name: 'Cat Toys',
        slug: 'cat-toys',
        parentCategory: null, // Will be populated by seed script (Cat Supplies)
        iconUrl: 'https://example.com/icons/cat-toys-icon.png',
        description: 'Interactive toys, mice and entertainment for cats',
        isPublished: true,
        sortOrder: 11,
    },
    {
        name: 'Cat Litter & Accessories',
        slug: 'cat-litter-accessories',
        parentCategory: null, // Will be populated by seed script (Cat Supplies)
        iconUrl: 'https://example.com/icons/cat-litter-accessories-icon.png',
        description: 'Cat litter, litter boxes and cleaning accessories',
        isPublished: true,
        sortOrder: 12,
    },

    // BIRD CATEGORIES
    {
        name: 'Bird Food',
        slug: 'bird-food',
        parentCategory: null, // Will be populated by seed script (Bird Supplies)
        iconUrl: 'https://example.com/icons/bird-food-icon.png',
        description: 'Nutritious seeds, pellets and food for all bird species',
        isPublished: true,
        sortOrder: 13,
    },
    {
        name: 'Bird Cages & Accessories',
        slug: 'bird-cages-accessories',
        parentCategory: null, // Will be populated by seed script (Bird Supplies)
        iconUrl: 'https://example.com/icons/bird-cages-accessories-icon.png',
        description: 'Cages, perches, feeders and habitat accessories for birds',
        isPublished: true,
        sortOrder: 14,
    },

    // FISH CATEGORIES
    {
        name: 'Fish Food',
        slug: 'fish-food',
        parentCategory: null, // Will be populated by seed script (Fish Supplies)
        iconUrl: 'https://example.com/icons/fish-food-icon.png',
        description: 'Specialized food for freshwater and saltwater fish',
        isPublished: true,
        sortOrder: 15,
    },
    {
        name: 'Aquarium Equipment',
        slug: 'aquarium-equipment',
        parentCategory: null, // Will be populated by seed script (Fish Supplies)
        iconUrl: 'https://example.com/icons/aquarium-equipment-icon.png',
        description: 'Tanks, filters, heaters and aquarium maintenance equipment',
        isPublished: true,
        sortOrder: 16,
    },

    // MISSING DOG CATEGORIES
    {
        name: 'Dog Crates, Beds & Houses',
        slug: 'dog-crates-beds-houses',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-crates-beds-houses-icon.png',
        description: 'Comfortable crates, beds, houses and sleeping solutions for dogs',
        isPublished: true,
        sortOrder: 17,
    },
    {
        name: 'Dog Food Bowls & Waterers',
        slug: 'dog-food-bowls-waterers',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-food-bowls-waterers-icon.png',
        description: 'Food bowls, water dispensers and feeding accessories for dogs',
        isPublished: true,
        sortOrder: 18,
    },
    {
        name: 'Dog Shampoos & Grooming Products',
        slug: 'dog-shampoos-grooming-products',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/dog-shampoos-grooming-products-icon.png',
        description: 'Shampoos, conditioners, brushes and grooming supplies for dogs',
        isPublished: true,
        sortOrder: 19,
    },

    // MISSING CAT CATEGORIES
    {
        name: 'Cat Dry Food & Kibble',
        slug: 'cat-dry-food-kibble',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-dry-food-kibble-icon.png',
        description: 'Premium dry kibble and crunchy food for cats',
        isPublished: true,
        sortOrder: 20,
    },
    {
        name: 'Cat Wet Food & Pate',
        slug: 'cat-wet-food-pate',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-wet-food-pate-icon.png',
        description: 'Delicious wet food, pate and canned meals for cats',
        isPublished: true,
        sortOrder: 21,
    },
    {
        name: 'Cat Catnip & Snacks',
        slug: 'cat-catnip-snacks',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-catnip-snacks-icon.png',
        description: 'Catnip, treats and healthy snacks for cats',
        isPublished: true,
        sortOrder: 22,
    },
    {
        name: 'Cat Toys & Teasers',
        slug: 'cat-toys-teasers',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-toys-teasers-icon.png',
        description: 'Interactive toys, teasers and play accessories for cats',
        isPublished: true,
        sortOrder: 23,
    },
    {
        name: 'Cat Scratching Posts & Cat Trees',
        slug: 'cat-scratching-posts-cat-trees',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-scratching-posts-cat-trees-icon.png',
        description: 'Scratching posts, cat trees and climbing structures',
        isPublished: true,
        sortOrder: 24,
    },
    {
        name: 'Cat Litter & Litter Boxes',
        slug: 'cat-litter-litter-boxes',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-litter-litter-boxes-icon.png',
        description: 'Cat litter, litter boxes and waste management supplies',
        isPublished: true,
        sortOrder: 25,
    },
    {
        name: 'Cat Carriers & Travel Bags',
        slug: 'cat-carriers-travel-bags',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-carriers-travel-bags-icon.png',
        description: 'Safe and comfortable carriers for cat travel',
        isPublished: true,
        sortOrder: 26,
    },
    {
        name: 'Cat Crates, Beds & Houses',
        slug: 'cat-crates-beds-houses',
        parentCategory: null, // Will be populated by seed script
        iconUrl: 'https://example.com/icons/cat-crates-beds-houses-icon.png',
        description: 'Comfortable beds, houses and resting places for cats',
        isPublished: true,
        sortOrder: 27,
    },
];

export default sampleCategories;
