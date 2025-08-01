/**
 * Test file for Vietnamese slug generation
 * Run this in browser console to test the slug generation
 */

import {
    generateSlug,
    generateSku,
    testVietnameseSlugGeneration,
    testVietnameseSkuGeneration,
} from './slugUtils.js';

// Test the specific case mentioned in the issue
console.log('=== TESTING VIETNAMESE SLUG GENERATION ===');

const testCase = 'Đồ cho mèo';
const expectedSlug = 'do-cho-meo';
const actualSlug = generateSlug(testCase);

console.log(`Input: "${testCase}"`);
console.log(`Expected: "${expectedSlug}"`);
console.log(`Actual: "${actualSlug}"`);
console.log(`✅ Test ${actualSlug === expectedSlug ? 'PASSED' : 'FAILED'}`);

// Run comprehensive tests
testVietnameseSlugGeneration();

// Test SKU generation
console.log('\n=== TESTING VIETNAMESE SKU GENERATION ===');

const skuTestCase = 'Đồ cho mèo';
const expectedSkuPattern = /^DCM\d{3}$/;
const actualSku = generateSku(skuTestCase);

console.log(`Input: "${skuTestCase}"`);
console.log(`Expected Pattern: ${expectedSkuPattern}`);
console.log(`Actual: "${actualSku}"`);
console.log(`✅ Test ${expectedSkuPattern.test(actualSku) ? 'PASSED' : 'FAILED'}`);

// Test deterministic generation (same input should produce same output)
const sku1 = generateSku(skuTestCase);
const sku2 = generateSku(skuTestCase);
console.log(`\n=== TESTING DETERMINISTIC GENERATION ===`);
console.log(`First generation: "${sku1}"`);
console.log(`Second generation: "${sku2}"`);
console.log(`✅ Deterministic: ${sku1 === sku2 ? 'PASSED' : 'FAILED'}`);

// Test different names produce different SKUs
const name1 = 'Andrew';
const name2 = 'Andrew Test';
const sku_name1 = generateSku(name1);
const sku_name2 = generateSku(name2);
console.log(`\n=== TESTING DIFFERENT NAMES ===`);
console.log(`"${name1}" → "${sku_name1}"`);
console.log(`"${name2}" → "${sku_name2}"`);
console.log(`✅ Different SKUs: ${sku_name1 !== sku_name2 ? 'PASSED' : 'FAILED'}`);

// Run comprehensive SKU tests
testVietnameseSkuGeneration();

// Additional test cases
const additionalTests = [
    { input: 'Thức ăn cho chó con', expected: 'thuc-an-cho-cho-con' },
    { input: 'Phụ kiện thú cưng cao cấp', expected: 'phu-kien-thu-cung-cao-cap' },
    { input: 'Đồ chơi giải trí thông minh', expected: 'do-choi-giai-tri-thong-minh' },
    { input: 'Sản phẩm chăm sóc sức khỏe', expected: 'san-pham-cham-soc-suc-khoe' },
    { input: 'Áo quần thời trang mùa đông', expected: 'ao-quan-thoi-trang-mua-dong' },
    { input: 'Thương hiệu nổi tiếng Việt Nam', expected: 'thuong-hieu-noi-tieng-viet-nam' },
    { input: 'Giá cả phải chăng chất lượng', expected: 'gia-ca-phai-chang-chat-luong' },
    { input: 'Dịch vụ giao hàng nhanh chóng', expected: 'dich-vu-giao-hang-nhanh-chong' },
];

console.log('\n=== ADDITIONAL TEST CASES ===');
additionalTests.forEach(({ input, expected }) => {
    const result = generateSlug(input);
    const passed = result === expected;
    console.log(
        `${passed ? '✅' : '❌'} "${input}" → "${result}" ${
            passed ? '' : `(expected: "${expected}")`
        }`,
    );
});

export { generateSlug, generateSku, testVietnameseSlugGeneration, testVietnameseSkuGeneration };
