import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import ParentCategory from '../src/models/parentCategory.js';
import Order from '../src/models/Order.js';
import Cart from '../src/models/Cart.js';

/**
 * Migration script to convert string references to ObjectId references
 * Run this ONLY if you have existing data with string references
 */

const migrateToObjectId = async () => {
    try {
        console.log('🚀 Starting migration to ObjectId references...');

        // 1. Migrate Orders - username string to User ObjectId
        console.log('📦 Migrating Orders...');
        const orders = await Order.find({}).lean();
        
        for (const order of orders) {
            if (typeof order.username === 'string') {
                const user = await User.findOne({ username: order.username });
                if (user) {
                    await Order.updateOne(
                        { _id: order._id },
                        { username: user._id }
                    );
                }
            }
            
            // Migrate orderItems productId from SKU to ObjectId
            const updatedItems = [];
            for (const item of order.orderItems) {
                if (typeof item.productId === 'string') {
                    const product = await Product.findOne({ sku: item.productId });
                    if (product) {
                        updatedItems.push({
                            ...item,
                            productId: product._id
                        });
                    }
                }
            }
            
            if (updatedItems.length > 0) {
                await Order.updateOne(
                    { _id: order._id },
                    { orderItems: updatedItems }
                );
            }
        }

        // 2. Migrate Carts - username string to User ObjectId
        console.log('🛒 Migrating Carts...');
        const carts = await Cart.find({}).lean();
        
        for (const cart of carts) {
            if (typeof cart.username === 'string') {
                const user = await User.findOne({ username: cart.username });
                if (user) {
                    await Cart.updateOne(
                        { _id: cart._id },
                        { username: user._id }
                    );
                }
            }
            
            // Migrate cart items productId
            const updatedItems = [];
            for (const item of cart.items) {
                if (typeof item.productId === 'string') {
                    const product = await Product.findOne({ sku: item.productId });
                    if (product) {
                        updatedItems.push({
                            ...item,
                            productId: product._id
                        });
                    }
                }
            }
            
            if (updatedItems.length > 0) {
                await Cart.updateOne(
                    { _id: cart._id },
                    { items: updatedItems }
                );
            }
        }

        // 3. Migrate Products - category slug to Category ObjectId
        console.log('📦 Migrating Products...');
        const products = await Product.find({}).lean();
        
        for (const product of products) {
            if (typeof product.category === 'string') {
                const category = await Category.findOne({ slug: product.category });
                if (category) {
                    await Product.updateOne(
                        { _id: product._id },
                        { category: category._id }
                    );
                }
            }
        }

        // 4. Migrate Categories - parentCategory name to ParentCategory ObjectId
        console.log('📂 Migrating Categories...');
        const categories = await Category.find({}).lean();
        
        for (const category of categories) {
            if (typeof category.parentCategory === 'string') {
                const parent = await ParentCategory.findOne({ name: category.parentCategory });
                if (parent) {
                    await Category.updateOne(
                        { _id: category._id },
                        { parentCategory: parent._id }
                    );
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

export default migrateToObjectId;

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await migrateToObjectId();
    process.exit(0);
}
