import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Category slug cannot exceed 100 characters']
    },
    parentCategory: {
        type: String,
        required: [true, 'Parent category is required'],
        trim: true,
        ref: 'ParentCategory'
    },
    iconUrl: {
        type: String,
        required: [true, 'Icon URL is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v) || v.startsWith('/');
            },
            message: 'Invalid icon URL format'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// Add indexes for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isPublished: 1 });
categorySchema.index({ name: 'text', description: 'text' });
// New compound indexes
categorySchema.index({ parentCategory: 1, isPublished: 1 });
categorySchema.index({ isPublished: 1, sortOrder: 1 });
categorySchema.index({ productCount: -1, isPublished: 1 });

// Pre-save middleware to ensure slug is lowercase and generate if missing
categorySchema.pre('save', function(next) {
    if (this.slug) {
        this.slug = this.slug.toLowerCase();
    } else if (this.name) {
        // Auto-generate slug from name if not provided
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')         // Replace spaces with hyphens
            .replace(/-+/g, '-')          // Replace multiple hyphens with single
            .trim();
    }
    next();
});

// Virtual to get products in this category
categorySchema.virtual('products', {
    ref: 'Product',
    localField: 'slug',
    foreignField: 'category'
});

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ category: this.slug });
    this.productCount = count;
    return this.save();
};

// Static methods for better performance
categorySchema.statics.findBySlug = function(slug) {
    return this.findOne({ slug: slug.toLowerCase() });
};

categorySchema.statics.findPublished = function() {
    return this.find({ isPublished: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findByParent = function(parentCategory) {
    return this.find({ parentCategory, isPublished: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.updateAllProductCounts = async function() {
    const categories = await this.find();
    const Product = mongoose.model('Product');
    
    for (const category of categories) {
        const count = await Product.countDocuments({ category: category.slug });
        await this.updateOne({ _id: category._id }, { productCount: count });
    }
};

const Category = mongoose.model('Category', categorySchema);

export default Category;