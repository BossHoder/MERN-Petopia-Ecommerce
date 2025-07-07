import mongoose from 'mongoose';

// ===========================================
// CART ITEM SCHEMA
// ===========================================
// This schema defines what each item in the cart looks like
const cartItemSchema = new mongoose.Schema({
    // Reference to the product being added to cart
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        // Check if the product actually exists in database
        validate: {
            validator: async function(v) {
                const Product = mongoose.model('Product');
                const product = await Product.findById(v);
                return !!product;
            },
            message: 'Product does not exist'
        }
    },
    // How many of this product the user wants
    quantity: {
        type: Number,
        required: true,
        min: 1, // Must be at least 1
    },
    // When this item was added or last updated
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// ===========================================
// MAIN CART SCHEMA
// ===========================================
// This schema defines the shopping cart for each user
const cartSchema = new mongoose.Schema({
    // Which user owns this cart (each user has only one cart)
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One cart per user
        // Check if the user actually exists in database
        validate: {
            validator: async function(v) {
                const User = mongoose.model('User');
                const user = await User.findById(v);
                return !!user;
            },
            message: 'User does not exist'
        }
    },
    // Array of products in this cart
    items: [cartItemSchema],
}, {
    timestamps: true, // Auto add createdAt and updatedAt fields
})

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Prevent adding the same product twice to cart
cartSchema.pre('save', function(next) {
    // Get all product IDs from cart items
    const productIds = this.items.map(item => item.productId);
    // Remove duplicates
    const uniqueProductIds = [...new Set(productIds)];
    
    // If we have duplicates, throw error
    if (productIds.length !== uniqueProductIds.length) {
        return next(new Error('Duplicate products in cart items'));
    }
    next();
});

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
// Calculate total number of items (including quantities)
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Calculate how many different products are in cart
cartSchema.virtual('totalUniqueItems').get(function() {
    return this.items.length;
});

// ===========================================
// INSTANCE METHODS (actions on individual cart)
// ===========================================
// Add a product to cart or increase quantity if already exists
cartSchema.methods.addItem = function(productId, quantity = 1) {
    // Check if product is already in cart
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
        // Product exists, just increase quantity
        existingItem.quantity += quantity;
        existingItem.addedAt = new Date();
    } else {
        // New product, add to cart
        this.items.push({
            productId,
            quantity,
            addedAt: new Date()
        });
    }
    
    return this.save();
};

// Remove a product completely from cart
cartSchema.methods.removeItem = function(productId) {
    // Filter out the product we want to remove
    this.items = this.items.filter(item => item.productId !== productId);
    return this.save();
};

// Change the quantity of a product in cart
cartSchema.methods.updateQuantity = function(productId, quantity) {
    // Find the product in cart
    const item = this.items.find(item => item.productId === productId);
    
    if (item) {
        if (quantity <= 0) {
            // If quantity is 0 or less, remove the item
            return this.removeItem(productId);
        }
        // Update quantity and timestamp
        item.quantity = quantity;
        item.addedAt = new Date();
        return this.save();
    }
    
    throw new Error('Product not found in cart');
};

// Remove all items from cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

// Check if cart has no items
cartSchema.methods.isEmpty = function() {
    return this.items.length === 0;
};

// ===========================================
// STATIC METHODS (actions on Cart model)
// ===========================================
// Find user's cart or create new one if doesn't exist
cartSchema.statics.findByUsernameOrCreate = async function(username) {
    // Try to find existing cart
    let cart = await this.findOne({ username });
    
    if (!cart) {
        // No cart found, create new one
        cart = new this({ username });
        await cart.save();
    }
    
    return cart;
};

// Remove old/expired carts (if you add expiry feature later)
cartSchema.statics.cleanupExpired = function() {
    return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// ===========================================
// DATABASE INDEXES (for better performance)
// ===========================================
cartSchema.index({ username: 1 }, { unique: true }); // Fast user lookup
cartSchema.index({ 'items.productId': 1 }); // Fast product lookup in cart
cartSchema.index({ updatedAt: -1 }); // Fast sorting by last update

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;