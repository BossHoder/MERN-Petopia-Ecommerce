/**
 * Test file for Vietnamese slug generation
 * Run this in browser console to test the slug generation
 */

import { generateSlug, testVietnameseSlugGeneration } from './slugUtils.js';

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
    console.log(`${passed ? '✅' : '❌'} "${input}" → "${result}" ${passed ? '' : `(expected: "${expected}")`}`);
});

export { generateSlug, testVietnameseSlugGeneration };
