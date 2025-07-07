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
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
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
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
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
    items: [cartItemSchema],
}, {
    timestamps: true,
})

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
cartSchema.pre('save', function(next) {
    const productIds = this.items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    
    if (productIds.length !== uniqueProductIds.length) {
        return next(new Error('Duplicate products in cart items'));
    }
    next();
});

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('totalUniqueItems').get(function() {
    return this.items.length;
});

// ===========================================
// INSTANCE METHODS (actions on individual cart)
// ===========================================
cartSchema.methods.addItem = function(productId, quantity = 1) {
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.addedAt = new Date();
    } else {
        this.items.push({
            productId,
            quantity,
            addedAt: new Date()
        });
    }
    
    return this.save();
};

cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    return this.save();
};

cartSchema.methods.updateQuantity = function(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    
    if (item) {
        if (quantity <= 0) {
            return this.removeItem(productId);
        }
        item.quantity = quantity;
        item.addedAt = new Date();
        return this.save();
    }
    
    throw new Error('Product not found in cart');
};

cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

cartSchema.methods.isEmpty = function() {
    return this.items.length === 0;
};

// ===========================================
// STATIC METHODS (actions on Cart model)
// ===========================================
cartSchema.statics.findByUsernameOrCreate = async function(username) {
    let cart = await this.findOne({ username });
    
    if (!cart) {
        cart = new this({ username });
        await cart.save();
    }
    
    return cart;
};

cartSchema.statics.cleanupExpired = function() {
    return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// ===========================================
// DATABASE INDEXES (for better performance)
// ===========================================
cartSchema.index({ username: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ updatedAt: -1 });

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;