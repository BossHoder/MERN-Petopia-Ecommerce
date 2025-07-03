import mongoose from 'mongoose';
import Product from '../models/Product.js';
import '../config/database.js';

// Sample product data for pet store
const sampleProducts = [
    {
        name: "Royal Canin Dog Food - Adult",
        description: "Premium dry dog food for adult dogs with balanced nutrition",
        price: 45.99,
        salePrice: 39.99,
        sku: "RC-DOG-ADULT-001",
        category: "Dog Food",
        stockQuantity: 50,
        images: [
            "https://example.com/images/royal-canin-dog.jpg"
        ],
        brand: "Royal Canin",
        petSpecifics: "For adult dogs 1-7 years",
        isPublished: true,
        ratings: 4.5,
        reviews: [],
        numReviews: 0
    },
    {
        name: "Cat Scratching Post - Premium",
        description: "Tall scratching post with multiple levels and hanging toys",
        price: 89.99,
        sku: "CAT-SCRATCH-PREM-001",
        category: "Cat Toys",
        stockQuantity: 25,
        images: [
            "https://example.com/images/cat-scratching-post.jpg"
        ],
        brand: "PetTopia",
        petSpecifics: "Suitable for all cat sizes",
        isPublished: true,
        ratings: 4.8,
        reviews: [],
        numReviews: 0
    },
    {
        name: "Fish Tank Aquarium - 20 Gallon",
        description: "Complete aquarium kit with filter, heater, and LED lighting",
        price: 129.99,
        salePrice: 109.99,
        sku: "FISH-TANK-20G-001",
        category: "Fish Tanks",
        stockQuantity: 15,
        images: [
            "https://example.com/images/fish-tank-20g.jpg"
        ],
        brand: "AquaTech",
        petSpecifics: "Perfect for beginner fish keepers",
        isPublished: true,
        ratings: 4.3,
        reviews: [],
        numReviews: 0
    },
    {
        name: "Bird Cage - Large Flight Cage",
        description: "Spacious flight cage for medium to large birds",
        price: 199.99,
        sku: "BIRD-CAGE-LG-001",
        category: "Bird Cages",
        stockQuantity: 8,
        images: [
            "https://example.com/images/bird-cage-large.jpg"
        ],
        brand: "FlightZone",
        petSpecifics: "For cockatiels, conures, and similar sized birds",
        isPublished: true,
        ratings: 4.6,
        reviews: [],
        numReviews: 0
    },
    {
        name: "Dog Leash - Retractable",
        description: "Heavy-duty retractable leash with comfortable grip handle",
        price: 24.99,
        sku: "DOG-LEASH-RET-001",
        category: "Dog Accessories",
        stockQuantity: 75,
        images: [
            "https://example.com/images/dog-leash-retractable.jpg"
        ],
        brand: "WalkEasy",
        petSpecifics: "For dogs up to 110 lbs",
        isPublished: true,
        ratings: 4.2,
        reviews: [],
        numReviews: 0
    }
];

export default sampleProducts;