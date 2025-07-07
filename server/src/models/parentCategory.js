import mongoose from 'mongoose';

// ===========================================
// PARENT CATEGORY SCHEMA
// ===========================================
// This schema defines main category groups (like "Dogs", "Cats", "Birds")
// Regular categories belong under these parent categories
const parentCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Parent category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Parent category name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// ===========================================
// DATABASE INDEXES (for faster searches)
// ===========================================
parentCategorySchema.index({ name: 1 });
parentCategorySchema.index({ isPublished: 1 });

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const ParentCategory = mongoose.model('ParentCategory', parentCategorySchema);

export default ParentCategory;