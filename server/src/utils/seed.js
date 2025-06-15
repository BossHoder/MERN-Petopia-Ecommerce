// seed.js

// Xóa dữ liệu cũ (tùy chọn) để tránh trùng lặp khi chạy lại file
db.orders.deleteMany({});
db.products.deleteMany({});
db.categories.deleteMany({});
db.users.deleteMany({});
db.blogs.deleteMany({});

// --- TẠO DỮ LIỆU MẪU ---

// 1. Users Collection
const users = [
  {
    _id: ObjectId("60d0fe4f5311236168a109ca"),
    name: "Admin User",
    email: "admin@example.com",
    // Trong thực tế, mật khẩu phải được mã hóa (hashed) bằng bcrypt
    password: "hashed_password_admin",
    role: "admin",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
  },
  {
    _id: ObjectId("60d0fe4f5311236168a109cb"),
    name: "John Doe",
    email: "john.doe@example.com",
    password: "hashed_password_user",
    role: "user",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 2, TP. Hồ Chí Minh"
  }
];
db.users.insertMany(users);
print("Users collection seeded.");

// 2. Categories Collection
const categories = [
  {
    _id: ObjectId("60d0fe4f5311236168a109cc"),
    name: "Thức ăn cho chó",
    slug: "thuc-an-cho-cho"
  },
  {
    _id: ObjectId("60d0fe4f5311236168a109cd"),
    name: "Đồ chơi cho mèo",
    slug: "do-choi-cho-meo"
  },
  {
    _id: ObjectId("60d0fe4f5311236168a109ce"),
    name: "Phụ kiện & Chuồng",
    slug: "phu-kien-chuong"
  }
];
db.categories.insertMany(categories);
print("Categories collection seeded.");

// 3. Products Collection
const products = [
  {
    name: "Hạt Royal Canin cho Chó Poodle",
    slug: "hat-royal-canin-cho-cho-poodle",
    description: "Thức ăn hạt khô Royal Canin dành riêng cho giống chó Poodle, giúp lông mượt và hệ tiêu hóa khỏe mạnh.",
    brand: "Royal Canin",
    price: 450000,
    category: ObjectId("60d0fe4f5311236168a109cc"), // Tham chiếu tới Category 'Thức ăn cho chó'
    countInStock: 50,
    image: "/images/royal-canin-poodle.jpg",
    reviews: [
        {
            user: ObjectId("60d0fe4f5311236168a109cb"), // John Doe
            name: "John Doe",
            rating: 5,
            comment: "Chất lượng tuyệt vời!"
        }
    ]
  },
  {
    name: "Cần câu lông vũ cho mèo",
    slug: "can-cau-long-vu-cho-meo",
    description: "Đồ chơi cần câu gắn lông vũ màu sắc sặc sỡ, kích thích bản năng săn mồi của mèo.",
    brand: "CatJoy",
    price: 75000,
    category: ObjectId("60d0fe4f5311236168a109cd"), // Tham chiếu tới Category 'Đồ chơi cho mèo'
    countInStock: 120,
    image: "/images/cat-toy.jpg",
    reviews: []
  },
  {
    name: "Chuồng sắt sơn tĩnh điện",
    slug: "chuong-sat-son-tinh-dien",
    description: "Chuồng sắt chắc chắn, có thể gấp gọn, phù hợp cho chó và mèo cỡ vừa và nhỏ.",
    brand: "PetHome",
    price: 850000,
    category: ObjectId("60d0fe4f5311236168a109ce"), // Tham chiếu tới Category 'Phụ kiện & Chuồng'
    countInStock: 20,
    image: "/images/pet-cage.jpg",
    reviews: []
  }
];
db.products.insertMany(products);
print("Products collection seeded.");

// Lấy ID của sản phẩm và người dùng để tạo đơn hàng
const userJohn = db.users.findOne({email: "john.doe@example.com"});
const productCanin = db.products.findOne({slug: "hat-royal-canin-cho-cho-poodle"});
const productToy = db.products.findOne({slug: "can-cau-long-vu-cho-meo"});

// 4. Orders Collection
const orders = [
  {
    user: userJohn._id, // Tham chiếu tới User John Doe
    orderItems: [
      {
        name: productCanin.name,
        qty: 1,
        image: productCanin.image,
        price: productCanin.price,
        product: productCanin._id // Tham chiếu tới sản phẩm
      },
      {
        name: productToy.name,
        qty: 2,
        image: productToy.image,
        price: productToy.price,
        product: productToy._id // Tham chiếu tới sản phẩm
      }
    ],
    shippingAddress: {
      address: "456 Đường XYZ, Quận 2, TP. Hồ Chí Minh",
      city: "TP. Hồ Chí Minh",
      postalCode: "700000",
      country: "Việt Nam"
    },
    paymentMethod: "Momo",
    paymentResult: {
      id: "TRANS12345",
      status: "COMPLETED",
      update_time: new Date(),
      email_address: "john.doe@example.com"
    },
    itemsPrice: productCanin.price * 1 + productToy.price * 2,
    taxPrice: 0,
    shippingPrice: 30000,
    totalPrice: (productCanin.price * 1 + productToy.price * 2) + 30000,
    isPaid: true,
    paidAt: new Date(),
    isDelivered: false
  }
];
db.orders.insertMany(orders);
print("Orders collection seeded.");

// 5. Blogs Collection
const blogs = [
  {
    title: "5 Mẹo Chăm Sóc Lông Chó Poodle Tại Nhà",
    slug: "5-meo-cham-soc-long-cho-poodle-tai-nha",
    content: "Nội dung chi tiết về cách chải lông, tắm, và sử dụng các sản phẩm dưỡng lông cho chó Poodle...",
    author: ObjectId("60d0fe4f5311236168a109ca"), // Admin User
    image: "/images/blog-poodle-care.jpg",
    tags: ["chăm sóc chó", "poodle", "làm đẹp"]
  },
  {
    title: "Vì Sao Mèo Của Bạn Cần Đồ Chơi?",
    slug: "vi-sao-meo-cua-ban-can-do-choi",
    content: "Bài viết phân tích tầm quan trọng của việc vui chơi đối với sức khỏe thể chất và tinh thần của loài mèo...",
    author: ObjectId("60d0fe4f5311236168a109ca"), // Admin User
    image: "/images/blog-cat-play.jpg",
    tags: ["chăm sóc mèo", "đồ chơi", "sức khỏe"]
  }
];
db.blogs.insertMany(blogs);
print("Blogs collection seeded.");

print("\n--- Database seeding completed! ---");