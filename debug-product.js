const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://localhost:27017/petopia-ecommerce');

// Define minimal schema to read existing data
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const reviewSchema = new mongoose.Schema({}, { strict: false });
const Review = mongoose.model('Review', reviewSchema);

async function debugData() {
    try {
        // Check if products have numReviews field
        const sampleProduct = await Product.findOne();
        console.log('\n📦 Sample Product fields:', Object.keys(sampleProduct._doc));
        console.log('🔢 numReviews value:', sampleProduct.numReviews);
        console.log('⭐ ratings value:', sampleProduct.ratings);
        
        // Check if reviews exist
        const reviewCount = await Review.countDocuments();
        console.log('\n📝 Total reviews in database:', reviewCount);
        
        if (reviewCount > 0) {
            const sampleReview = await Review.findOne().populate('product', 'name numReviews');
            console.log('📋 Sample review:', {
                id: sampleReview._id,
                productId: sampleReview.product._id,
                productName: sampleReview.product.name,
                productNumReviews: sampleReview.product.numReviews,
                rating: sampleReview.rating,
                status: sampleReview.status,
                isVisible: sampleReview.isVisible
            });
        }
        
        // Check specific product from the HTML (diu-cho-meo-cao-cap)
        const targetProduct = await Product.findOne({ slug: 'diu-cho-meo-cao-cap' });
        if (targetProduct) {
            console.log('\n🎯 Target product "Địu chó mèo cao cấp":', {
                id: targetProduct._id,
                name: targetProduct.name,
                numReviews: targetProduct.numReviews,
                ratings: targetProduct.ratings,
                hasNumReviewsField: 'numReviews' in targetProduct._doc
            });
            
            // Check reviews for this specific product
            const productReviews = await Review.find({ product: targetProduct._id });
            console.log('📝 Reviews for this product:', productReviews.length);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

debugData();