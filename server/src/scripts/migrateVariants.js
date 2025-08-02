import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { generateCombinationKey } from '../utils/variantUtils.js';

/**
 * Migration script to convert legacy variant system to new combination system
 * 
 * This script will:
 * 1. Find products with legacy variants
 * 2. Convert them to the new variant attribute + combination system
 * 3. Preserve all existing data (stock, pricing, images, etc.)
 * 4. Generate proper combination keys and SKUs
 */

const migrateVariants = async () => {
    try {
        console.log('🔄 Starting variant migration...');

        // Find products with legacy variants
        const productsWithLegacyVariants = await Product.find({
            variants: { $exists: true, $ne: [] },
            variantAttributes: { $exists: false }
        });

        console.log(`📦 Found ${productsWithLegacyVariants.length} products with legacy variants`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const product of productsWithLegacyVariants) {
            try {
                console.log(`\n🔄 Migrating product: ${product.name} (${product._id})`);
                
                // Group variants by name (attribute type)
                const variantGroups = {};
                product.variants.forEach(variant => {
                    if (!variantGroups[variant.name]) {
                        variantGroups[variant.name] = [];
                    }
                    variantGroups[variant.name].push(variant);
                });

                // Create variant attributes
                const variantAttributes = Object.keys(variantGroups).map((attributeName, index) => {
                    const variants = variantGroups[attributeName];
                    
                    // Extract unique values from comma-separated strings
                    const allValues = new Set();
                    variants.forEach(variant => {
                        if (variant.value && typeof variant.value === 'string') {
                            variant.value.split(',').forEach(val => {
                                const trimmedVal = val.trim();
                                if (trimmedVal) {
                                    allValues.add(trimmedVal);
                                }
                            });
                        }
                    });

                    return {
                        name: attributeName.toLowerCase().replace(/\s+/g, ''),
                        displayName: attributeName,
                        values: Array.from(allValues).map(value => ({
                            value: value.toLowerCase(),
                            displayName: value,
                            colorCode: attributeName.toLowerCase().includes('color') ? getColorCode(value) : '',
                            isActive: true
                        })),
                        isRequired: true,
                        sortOrder: index
                    };
                });

                // Create variant combinations
                const variantCombinations = [];
                
                // If there's only one attribute type, create combinations for each value
                if (variantAttributes.length === 1) {
                    const attribute = variantAttributes[0];
                    
                    attribute.values.forEach(value => {
                        // Find the original variant that matches this value
                        const originalVariant = product.variants.find(v => 
                            v.name === attribute.displayName && 
                            v.value && v.value.toLowerCase().includes(value.value.toLowerCase())
                        );

                        const attributeSelections = { [attribute.name]: value.value };
                        const combinationKey = generateCombinationKey(attributeSelections);
                        const sku = generateCombinationSku(product.sku, attributeSelections);

                        variantCombinations.push({
                            combinationKey,
                            attributes: [{
                                attributeName: attribute.name,
                                attributeValue: value.value
                            }],
                            sku,
                            price: originalVariant?.price || null,
                            salePrice: null,
                            stockQuantity: originalVariant?.stockQuantity || 0,
                            lowStockThreshold: 5,
                            images: originalVariant?.images || [],
                            isActive: originalVariant?.isActive !== false,
                            weight: null,
                            dimensions: {}
                        });
                    });
                } else if (variantAttributes.length > 1) {
                    // Multiple attributes - create cartesian product
                    const generateCombinations = (attributes, current = {}, index = 0) => {
                        if (index === attributes.length) {
                            const combinationKey = generateCombinationKey(current);
                            const sku = generateCombinationSku(product.sku, current);
                            
                            // Try to find matching original variant
                            const originalVariant = findBestMatchingVariant(product.variants, current);

                            variantCombinations.push({
                                combinationKey,
                                attributes: Object.keys(current).map(key => ({
                                    attributeName: key,
                                    attributeValue: current[key]
                                })),
                                sku,
                                price: originalVariant?.price || null,
                                salePrice: null,
                                stockQuantity: originalVariant?.stockQuantity || 0,
                                lowStockThreshold: 5,
                                images: originalVariant?.images || [],
                                isActive: originalVariant?.isActive !== false,
                                weight: null,
                                dimensions: {}
                            });
                            return;
                        }

                        const attribute = attributes[index];
                        attribute.values.forEach(value => {
                            generateCombinations(attributes, {
                                ...current,
                                [attribute.name]: value.value
                            }, index + 1);
                        });
                    };

                    generateCombinations(variantAttributes);
                }

                // Update the product
                await Product.findByIdAndUpdate(product._id, {
                    $set: {
                        variantAttributes,
                        variantCombinations
                    }
                });

                console.log(`✅ Migrated ${product.name}: ${variantAttributes.length} attributes, ${variantCombinations.length} combinations`);
                migratedCount++;

            } catch (error) {
                console.error(`❌ Error migrating product ${product.name}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n🎉 Migration completed!`);
        console.log(`✅ Successfully migrated: ${migratedCount} products`);
        console.log(`❌ Errors: ${errorCount} products`);

        if (errorCount === 0) {
            console.log(`\n💡 You can now safely remove legacy variants by running:`);
            console.log(`   db.products.updateMany({}, { $unset: { variants: 1 } })`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Helper function to generate combination SKU
const generateCombinationSku = (baseSku, attributeSelections) => {
    const sortedKeys = Object.keys(attributeSelections).sort();
    const suffix = sortedKeys
        .map(key => `${key.charAt(0).toUpperCase()}${attributeSelections[key].charAt(0).toUpperCase()}`)
        .join('');
    return `${baseSku}-${suffix}`;
};

// Helper function to get color code for common colors
const getColorCode = (colorName) => {
    const colorMap = {
        'red': '#FF0000',
        'đỏ': '#FF0000',
        'blue': '#0000FF',
        'xanh': '#0000FF',
        'green': '#00FF00',
        'xanh lá': '#00FF00',
        'yellow': '#FFFF00',
        'vàng': '#FFFF00',
        'black': '#000000',
        'đen': '#000000',
        'white': '#FFFFFF',
        'trắng': '#FFFFFF',
        'pink': '#FFC0CB',
        'hồng': '#FFC0CB',
        'purple': '#800080',
        'tím': '#800080',
        'orange': '#FFA500',
        'cam': '#FFA500',
        'brown': '#A52A2A',
        'nâu': '#A52A2A',
        'gray': '#808080',
        'grey': '#808080',
        'xám': '#808080'
    };
    
    return colorMap[colorName.toLowerCase()] || '';
};

// Helper function to find best matching variant
const findBestMatchingVariant = (variants, attributeSelections) => {
    // Try to find a variant that contains all the selected values
    return variants.find(variant => {
        const variantValues = variant.value ? variant.value.toLowerCase() : '';
        return Object.values(attributeSelections).every(value => 
            variantValues.includes(value.toLowerCase())
        );
    }) || variants[0]; // Fallback to first variant
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petopia';
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('📡 Connected to MongoDB');
            return migrateVariants();
        })
        .then(() => {
            console.log('🏁 Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration script failed:', error);
            process.exit(1);
        });
}

export default migrateVariants;
