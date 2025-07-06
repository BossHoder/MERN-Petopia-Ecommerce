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
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Parent category is required'],
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

// Pre-save middleware to ensure slug is lowercase
categorySchema.pre('save', function(next) {
    if (this.slug) {
        this.slug = this.slug.toLowerCase();
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

const Category = mongoose.model('Category', categorySchema);

export default Category;