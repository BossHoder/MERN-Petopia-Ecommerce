import mongoose from 'mongoose';
import { generateSlug } from '../helpers/stringHelper.js';

// ===========================================
// PARENT CATEGORY SCHEMA
// ===========================================
// This schema defines main category groups (like "Dogs", "Cats", "Birds")
// Regular categories belong under these parent categories
const parentCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Parent category name is required'],
            unique: true,
            trim: true,
            maxlength: [100, 'Parent category name cannot exceed 100 characters'],
        },
        // URL-friendly version of name (like "dog-supplies")
        slug: {
            type: String,
            required: [true, 'Parent category slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [100, 'Parent category slug cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        image: {
            type: String,
            required: [true, 'Image URL is required'],
            trim: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Auto-generate slug from name if not provided
parentCategorySchema.pre('save', function (next) {
    if (this.slug) {
        this.slug = this.slug.toLowerCase();
    } else if (this.name) {
        this.slug = generateSlug(this.name);
    }
    next();
});

// ===========================================
// STATIC METHODS (actions on ParentCategory model)
// ===========================================
// Find parent category by its slug
parentCategorySchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: slug.toLowerCase() });
};

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
parentCategorySchema.index({ slug: 1 }); // Required for URL routing
parentCategorySchema.index({ name: 1, isPublished: 1 }); // Combined lookup for published categories

// REMOVED FOR SMALL SCALE (can add back when needed):
// parentCategorySchema.index({ name: 1 }); // Covered by compound index above
// parentCategorySchema.index({ isPublished: 1 }); // Covered by compound index above

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const ParentCategory = mongoose.model('ParentCategory', parentCategorySchema);

export default ParentCategory;
