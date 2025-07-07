import mongoose from 'mongoose';

// ===========================================
// PARENT CATEGORY SCHEMA
// ===========================================
// This schema defines main category groups (like "Dogs", "Cats", "Birds")
// Regular categories belong under these parent categories
const parentCategorySchema = new mongoose.Schema({
    // Parent category name (like "Dogs", "Cats")
    name: {
        type: String,
        required: [true, 'Parent category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Parent category name cannot exceed 100 characters']
    },
    // Description of this parent category
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Main image for this parent category
    image: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    // Whether this parent category is visible to customers
    isPublished: {
        type: Boolean,
        default: true
    },
    // Order to display parent categories (lower numbers first)
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Auto add createdAt and updatedAt
    versionKey: false // Remove __v field
});

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
parentCategorySchema.index({ name: 1 }); // Find by name quickly
parentCategorySchema.index({ isPublished: 1 }); // Filter published categories

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const ParentCategory = mongoose.model('ParentCategory', parentCategorySchema);

export default ParentCategory;