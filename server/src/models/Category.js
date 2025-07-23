import mongoose from 'mongoose';
import { generateSlug } from '../helpers/stringHelper.js';

// ===========================================
// CATEGORY SCHEMA
// ===========================================
// This schema defines product categories (like "Dog Food", "Cat Toys", etc.)
const categorySchema = new mongoose.Schema(
    {
        // Category name (displayed to users)
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Category name cannot exceed 100 characters'],
        },
        // URL-friendly version of name (like "dog-food")
        slug: {
            type: String,
            required: [true, 'Category slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [100, 'Category slug cannot exceed 100 characters'],
        },
        // Which parent category this belongs to (like "Dogs" > "Dog Food")
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParentCategory',
            required: [true, 'Parent category is required'],
            // Check if parent category actually exists
            validate: {
                validator: async function (v) {
                    const ParentCategory = mongoose.model('ParentCategory');
                    const parent = await ParentCategory.findById(v);
                    return !!parent;
                },
                message: 'Parent category does not exist',
            },
        },
        // Icon image for this category
        iconUrl: {
            type: String,
            required: [true, 'Icon URL is required'],
            trim: true,
            // Check if URL format is valid
            validate: {
                validator: function (v) {
                    return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v) || v.startsWith('/');
                },
                message: 'Invalid icon URL format',
            },
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        productCount: {
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
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
categorySchema.index({ slug: 1 }); // Required for URL routing
categorySchema.index({ parentCategory: 1, isPublished: 1 }); // Main category navigation
categorySchema.index({ name: 'text', description: 'text' }); // Search functionality

// REMOVED FOR SMALL SCALE (can add back when needed):
// categorySchema.index({ parentCategory: 1 }); // Covered by compound index above
// categorySchema.index({ isPublished: 1 }); // Covered by compound index above
// categorySchema.index({ isPublished: 1, sortOrder: 1 }); // Sorting can be done in memory
// categorySchema.index({ productCount: -1, isPublished: 1 }); // Analytics not critical

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Auto-generate slug from name if not provided
categorySchema.pre('save', function (next) {
    if (this.slug) {
        this.slug = this.slug.toLowerCase();
    } else if (this.name) {
        this.slug = generateSlug(this.name);
    }
    next();
});

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
// Get all products that belong to this category
categorySchema.virtual('products', {
    ref: 'Product',
    localField: 'slug',
    foreignField: 'category',
});

// ===========================================
// INSTANCE METHODS (actions on individual category)
// ===========================================
// Update the count of products in this category
categorySchema.methods.updateProductCount = async function () {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ category: this.slug });
    this.productCount = count;
    return this.save();
};

// ===========================================
// STATIC METHODS (actions on Category model)
// ===========================================
// Find category by its slug
categorySchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: slug.toLowerCase() });
};

// Get all published categories, sorted by order
categorySchema.statics.findPublished = function () {
    return this.find({ isPublished: true }).sort({ sortOrder: 1, name: 1 });
};

// Get all categories under a specific parent category
categorySchema.statics.findByParent = function (parentCategory) {
    return this.find({ parentCategory, isPublished: true }).sort({ sortOrder: 1, name: 1 });
};

// Update product counts for all categories (maintenance function)
categorySchema.statics.updateAllProductCounts = async function () {
    const categories = await this.find();
    const Product = mongoose.model('Product');
    for (const category of categories) {
        const count = await Product.countDocuments({ category: category._id });
        await this.updateOne({ _id: category._id }, { productCount: count });
    }
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Category = mongoose.model('Category', categorySchema);

export default Category;
