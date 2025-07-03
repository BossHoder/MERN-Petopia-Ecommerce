import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            }
        }
    ],
}, {
    timestamps: true,
})

// Add indexes for better performance
cartSchema.index({ username: 1 }, { unique: true });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
cartSchema.index({ 'items.productId': 1 });
const Cart = mongoose.model('Cart', cartSchema);

//Validation: dont allow duplicate products in the same cart
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

export default Cart;