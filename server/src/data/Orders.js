const sampleOrders = [
    {
        username: "admin",
        orderItems: [
            {
                productId: "DOG-FOOD-DRY-001",
                quantity: 2,
            },
            {
                productId: "DOG-FOOD-WET-001",
                quantity: 1,
            }
        ],
        shippingAddress: {
            address: "123 Nguyen Trai, Q1, HCM",
            phone: "0123456789"
        },
        totalAmount: 49.48,
        paymentMethod: "cod",
        paymentResult: "pending",
        status: "pending",
    }
]

export default sampleOrders;