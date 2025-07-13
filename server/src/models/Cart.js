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
            validator: async function (v) {
                const Product = mongoose.model('Product');
                const product = await Product.findById(v);
                return !!product;
            },
            message: 'Product does not exist',
        },
    },
    variantId: {
        type: String,
        trim: true,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

// ===========================================
// MAIN CART SCHEMA
// ===========================================
// This schema defines the shopping cart for each user
const cartSchema = new mongoose.Schema(
    {
        // Support both logged-in users and guest sessions
        username: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Can be null for guest users
            // Check if the user actually exists in database
            validate: {
                validator: async function (v) {
                    if (!v) return true; // Allow null for guest users
                    const User = mongoose.model('User');
                    const user = await User.findById(v);
                    return !!user;
                },
                message: 'User does not exist',
            },
        },
        // Session ID for guest users
        sessionId: {
            type: String,
            trim: true,
            index: true,
        },
        items: [cartItemSchema],
        // Cart expiration
        expiresAt: {
            type: Date,
            default: function () {
                // Guest carts expire in 7 days, user carts in 30 days
                const days = this.username ? 30 : 7;
                return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            },
            index: { expireAfterSeconds: 0 },
        },
        shippingAddress: {
            city: String,
            district: String,
        },
        appliedCoupon: {
            code: String,
            discount: Number,
            discountType: {
                type: String,
                enum: ['percentage', 'fixed'],
            },
        },
        // Cart totals (cached for performance)
        totals: {
            subtotal: {
                type: Number,
                default: 0,
            },
            shipping: {
                type: Number,
                default: 0,
            },
            discount: {
                type: Number,
                default: 0,
            },
            total: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    },
);

// ===========================================
// OPTIMIZED INDEXES FOR SMALL SCALE (1000 users)
// ===========================================
// Keep only essential indexes to save storage
cartSchema.index({ username: 1 }); // Primary lookup
cartSchema.index({ sessionId: 1 }); // Guest cart lookup
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL cleanup

// Remove compound index as it's not needed for small scale
// cartSchema.index({ username: 1, sessionId: 1 }); // REMOVED

// ===========================================
// MIDDLEWARE (runs before saving)
// ===========================================
// Ensure either username or sessionId is provided
cartSchema.pre('save', function (next) {
    if (!this.username && !this.sessionId) {
        return next(new Error('Either username or sessionId must be provided'));
    }
    next();
});

// Prevent duplicate products in cart items
cartSchema.pre('save', function (next) {
    const productIds = this.items.map((item) => `${item.productId}-${item.variantId || ''}`);
    const uniqueProductIds = [...new Set(productIds)];

    if (productIds.length !== uniqueProductIds.length) {
        return next(new Error('Duplicate products in cart items'));
    }
    next();
});

// Auto-calculate totals before saving
cartSchema.pre('save', function (next) {
    this.calculateTotals();
    next();
});

// ===========================================
// VIRTUAL FIELDS (calculated fields)
// ===========================================
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('totalUniqueItems').get(function () {
    return this.items.length;
});

cartSchema.virtual('isExpired').get(function () {
    return this.expiresAt && this.expiresAt < new Date();
});

// ===========================================
// INSTANCE METHODS (actions on individual cart)
// ===========================================
// Calculate cart totals
cartSchema.methods.calculateTotals = function () {
    this.totals.subtotal = this.items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Free shipping over 200k VND
    this.totals.shipping = this.totals.subtotal >= 200000 ? 0 : 20000;

    // Apply discount if any
    if (this.appliedCoupon) {
        if (this.appliedCoupon.discountType === 'percentage') {
            this.totals.discount = this.totals.subtotal * (this.appliedCoupon.discount / 100);
        } else {
            this.totals.discount = this.appliedCoupon.discount;
        }
    }

    this.totals.total = this.totals.subtotal + this.totals.shipping - this.totals.discount;
    return this.totals;
};

cartSchema.methods.addItem = function (productId, quantity = 1, variantId = null, productData = {}) {
    const existingItemIndex = this.items.findIndex(
        (item) => item.productId.toString() === productId.toString() && item.variantId === variantId,
    );

    if (existingItemIndex !== -1) {
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].addedAt = new Date();
    } else {
        this.items.push({
            productId,
            variantId,
            productName: productData.name,
            productImage: productData.image,
            price: productData.price,
            quantity,
            addedAt: new Date(),
        });
    }

    return this.save();
};

cartSchema.methods.removeItem = function (productId, variantId = null) {
    this.items = this.items.filter(
        (item) => !(item.productId.toString() === productId.toString() && item.variantId === variantId),
    );
    return this.save();
};

cartSchema.methods.updateQuantity = function (productId, quantity, variantId = null) {
    const item = this.items.find(
        (item) => item.productId.toString() === productId.toString() && item.variantId === variantId,
    );

    if (item) {
        if (quantity <= 0) {
            return this.removeItem(productId, variantId);
        }
        item.quantity = quantity;
        item.addedAt = new Date();
        return this.save();
    }

    throw new Error('Product not found in cart');
};

cartSchema.methods.clearCart = function () {
    this.items = [];
    this.appliedCoupon = null;
    this.totals = {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
    };
    return this.save();
};

cartSchema.methods.isEmpty = function () {
    return this.items.length === 0;
};

cartSchema.methods.applyCoupon = function (code, discount, discountType) {
    this.appliedCoupon = { code, discount, discountType };
    return this.save();
};

// ===========================================
// STATIC METHODS (actions on Cart model)
// ===========================================
cartSchema.statics.findByUserOrSession = async function (username, sessionId) {
    if (username) {
        let cart = await this.findOne({ username });
        if (!cart) {
            cart = new this({ username });
            await cart.save();
        }
        return cart;
    } else if (sessionId) {
        let cart = await this.findOne({ sessionId });
        if (!cart) {
            cart = new this({ sessionId });
            await cart.save();
        }
        return cart;
    }
    throw new Error('Either username or sessionId must be provided');
};

cartSchema.statics.cleanupExpired = function () {
    return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Merge guest cart with user cart when user logs in
cartSchema.statics.mergeGuestCart = async function (sessionId, username) {
    const guestCart = await this.findOne({ sessionId });
    if (!guestCart || guestCart.isEmpty()) {
        return null;
    }

    const userCart = await this.findByUserOrSession(username);

    // Merge items from guest cart to user cart
    for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
            (item) =>
                item.productId.toString() === guestItem.productId.toString() && item.variantId === guestItem.variantId,
        );

        if (existingItem) {
            existingItem.quantity += guestItem.quantity;
        } else {
            userCart.items.push(guestItem);
        }
    }

    await userCart.save();
    await guestCart.deleteOne();

    return userCart;
};

// ===========================================
// CREATE AND EXPORT MODEL
// ===========================================
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
