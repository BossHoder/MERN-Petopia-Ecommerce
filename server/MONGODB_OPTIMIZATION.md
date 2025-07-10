# MongoDB Optimization for Small Scale (1000 users, 500MB)

## 📊 Current Index Analysis

Dự án hiện tại có **quá nhiều indexes** cho quy mô nhỏ:
- **Cart**: 3 indexes (tối ưu)
- **Product**: 8 indexes (quá nhiều)
- **Order**: 7 indexes (quá nhiều) 
- **User**: 2 indexes (phù hợp)
- **Coupon**: 3 indexes (phù hợp)

## 🎯 Khuyến nghị tối ưu

### 1. **GIỮ LẠI - Indexes quan trọng**

#### User Model ✅
```javascript
// Cần thiết cho authentication
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
```

#### Cart Model ✅
```javascript
// Đã được tối ưu
cartSchema.index({ username: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 2. **LOẠI BỎ - Indexes không cần thiết**

#### Product Model ❌
```javascript
// CÓ THỂ LOẠI BỎ cho quy mô nhỏ:
productSchema.index({ brand: 1 }); // Loại bỏ
productSchema.index({ price: 1, salePrice: 1 }); // Loại bỏ
productSchema.index({ stockQuantity: 1, isPublished: 1 }); // Loại bỏ
productSchema.index({ ratings: -1, numReviews: -1 }); // Loại bỏ

// GIỮ LẠI:
productSchema.index({ sku: 1 }, { unique: true }); // Cần thiết
productSchema.index({ category: 1, isPublished: 1 }); // Quan trọng
productSchema.index({ name: 'text', description: 'text' }); // Search
```

#### Order Model ❌
```javascript
// CÓ THỂ LOẠI BỎ:
orderSchema.index({ paymentMethod: 1 }); // Loại bỏ
orderSchema.index({ 'orderItems.productId': 1 }); // Loại bỏ
orderSchema.index({ 'appliedCoupon.code': 1 }); // Loại bỏ

// GIỮ LẠI:
orderSchema.index({ username: 1, status: 1 }); // Quan trọng
orderSchema.index({ orderNumber: 1 }, { unique: true }); // Cần thiết
orderSchema.index({ createdAt: -1 }); // Sắp xếp orders
```

## 💾 Tác động Storage

### Trước tối ưu:
- **20+ indexes** trên toàn bộ database
- Ước tính: ~50-100MB cho indexes
- Chiếm: 10-20% storage khả dụng

### Sau tối ưu:
- **12-14 indexes** quan trọng
- Ước tính: ~20-30MB cho indexes  
- Chiếm: 4-6% storage khả dụng
- **Tiết kiệm: 30-70MB storage** 🎉

## 🚀 Performance với 1000 users

### Collection sizes dự kiến:
- **Users**: 1000 documents (~1MB)
- **Products**: 500-1000 documents (~5-10MB)
- **Orders**: 5000-10000 documents (~50-100MB)
- **Carts**: 100-200 active carts (~1-2MB)

### Với số lượng này:
- **Scan toàn bộ collection vẫn nhanh** (<100ms)
- **Indexes chỉ cần thiết cho**:
  - Unique constraints
  - Frequent queries
  - Text search
  - TTL cleanup

## 📝 Implementation Steps

### 1. Drop không cần thiết indexes
```javascript
// Connect to MongoDB
db.products.dropIndex({ brand: 1 });
db.products.dropIndex({ price: 1, salePrice: 1 });
db.products.dropIndex({ stockQuantity: 1, isPublished: 1 });
db.products.dropIndex({ ratings: -1, numReviews: -1 });

db.orders.dropIndex({ paymentMethod: 1 });
db.orders.dropIndex({ 'orderItems.productId': 1 });
db.orders.dropIndex({ 'appliedCoupon.code': 1 });
```

### 2. Monitor performance
```javascript
// Check query performance
db.products.find({category: "dog-food"}).explain("executionStats");
db.orders.find({username: ObjectId("...")}).explain("executionStats");
```

### 3. Add back nếu cần
Khi users tăng lên >5000, có thể cần add lại:
- Brand filtering index
- Price range queries
- Advanced search indexes

## 🔧 Monitoring Tools

1. **MongoDB Compass**: Xem storage usage
2. **Atlas Performance Advisor**: Khuyến nghị indexes
3. **Slow Query Log**: Identify performance issues

## 📈 Scale-up Strategy

### 1000+ users: Current optimization
### 5000+ users: Add brand, price indexes
### 10000+ users: Add full-text search improvements
### 50000+ users: Consider sharding

## 🎯 Kết luận

Với **1000 users và 500MB storage**, việc giảm indexes từ 20+ xuống 12-14 sẽ:

✅ **Tiết kiệm 30-70MB storage**
✅ **Tăng tốc độ write operations**
✅ **Giảm memory usage**
✅ **Vẫn đảm bảo performance tốt**

Đây là cách tiếp cận **Right-sized** cho quy mô hiện tại!
