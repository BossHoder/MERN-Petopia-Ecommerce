import mongoose from 'mongoose';

// Add addedAt field to items schema first
const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        trim: true
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

const cartSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    items: [cartItemSchema], // Use the defined schema
}, {
    timestamps: true,
})

// Move ALL middleware and methods BEFORE model creation
cartSchema.pre('save', function(next) {
    const productIds = this.items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    
    if (productIds.length !== uniqueProductIds.length) {
        return next(new Error('Duplicate products in cart items'));
    }
    next();
});

// Virtual fields
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('totalUniqueItems').get(function() {
    return this.items.length;
});

// Instance methods
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

// Static methods
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

// Add indexes for better performance
cartSchema.index({ username: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });

// CREATE MODEL LAST
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;