import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
});

const ShippingAddressSchema = new Schema({
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
});

const PaymentResultSchema = new Schema({
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
});

const OrderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        orderItems: [OrderItemSchema],
        shippingAddress: ShippingAddressSchema,
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: PaymentResultSchema,
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

// Pre-save hook to generate a unique order number
OrderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
        const lastOrderNumber = lastOrder && lastOrder.orderNumber ? parseInt(lastOrder.orderNumber.slice(1)) : 0;
        const newOrderNumber = lastOrderNumber + 1;
        this.orderNumber = 'D' + String(newOrderNumber).padStart(6, '0');
    }
    next();
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
