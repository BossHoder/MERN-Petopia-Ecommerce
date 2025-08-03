import mongoose from 'mongoose';
const { Schema } = mongoose;

const CartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    // Variant information for products with variants
    selectedVariants: {
        variantId: {
            type: String,
            required: false,
            // This stores the combination SKU or unique identifier
        },
        attributes: [
            {
                attributeName: {
                    type: String,
                    required: true,
                    // e.g., "Color", "Size"
                },
                attributeDisplayName: {
                    type: String,
                    required: false,
                    // e.g., "Màu sắc", "Kích cỡ"
                },
                attributeValue: {
                    type: String,
                    required: true,
                    // e.g., "red", "large"
                },
                valueDisplayName: {
                    type: String,
                    required: false,
                    // e.g., "Đỏ", "Lớn"
                },
                colorCode: {
                    type: String,
                    required: false,
                    // For color attributes, hex color code
                },
            },
        ],
        combinationKey: {
            type: String,
            required: false,
            // For quick lookup, e.g., "color:red,size:large"
        },
        images: [
            {
                type: String,
                required: false,
                // Variant-specific images
            },
        ],
    },
});

const CartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [CartItemSchema],
        total: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

CartSchema.pre('save', function (next) {
    this.total = this.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    next();
});

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
