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
