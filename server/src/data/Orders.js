const sampleOrders = [
    {
        orderNumber: 'ORD-1720272000000-ABC12',
        username: 'admin',
        orderItems: [
            {
                productId: 'DOG-FOOD-DRY-001',
                quantity: 2,
            },
            {
                productId: 'DOG-FOOD-WET-001',
                quantity: 1,
            },
        ],
        shippingAddress: {
            fullName: 'Nguyễn Văn Admin',
            address: '123 Nguyen Trai, Q1, HCM',
            city: 'Hồ Chí Minh',
            district: 'Quận 1',
            ward: 'Phường Bến Nghé',
            phone: '0123456789',
        },
        shippingPrice: 5.0,
        taxPrice: 0,
        discount: 0,
        totalAmount: 49.48,
        paymentMethod: 'bank_transfer',
        paymentResult: {
            id: 'BT-PhaevqOivlKJwgvc',
            status: 'completed',
            update_time: '2024-06-10T10:00:00Z',
            email_address: 'customer@example.com',
        },
        status: 'pending',
    },
];

export default sampleOrders;
