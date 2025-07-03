const sampleCart = [
    {
        username: "admin",
        items: [
            {
                productId: "DOG-FOOD-DRY-001",
                quantity: 2,
                addedAt: new Date("2024-12-01T10:00:00Z")
            },
            {
                productId: "DOG-FOOD-WET-001",
                quantity: 1,
                addedAt: new Date("2024-12-02T14:30:00Z")
            }
        ],
        updatedAt: new Date()
    },
    {
        username: "john_doe",
        items: [
            {
                productId: "DOG-VIT-001",
                quantity: 1,
                addedAt: new Date("2024-12-03T09:15:00Z")
            },
            {
                productId: "DOG-TOY-001",
                quantity: 3,
                addedAt: new Date("2024-12-03T09:20:00Z")
            }
        ],
        updatedAt: new Date()
    }
];

export default sampleCart;