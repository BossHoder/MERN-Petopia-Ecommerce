# COD-Specific Order Status Logic

## Overview
Implementation of Cash on Delivery (COD) specific business rules for order status transitions in the Petopia admin system.

## Business Rules

### 🚫 **Non-COD Orders (Credit Card, PayPal, etc.)**
- **Must be PAID** before status can be changed to:
  - `delivering` - Cannot start delivery without payment
  - `delivered` - Cannot mark as delivered without payment

### ✅ **COD Orders (Cash on Delivery)**
- **Can be changed** to `delivering` or `delivered` **WITHOUT payment**
- Payment is collected upon delivery
- No payment validation required for status transitions

## Implementation Details

### Frontend Validation (`orderStatusTransitions.js`)

```javascript
// Status validation with COD logic
export const validatePaymentForStatus = (newStatus, isPaid, paymentMethod) => {
    // Check if status requires payment validation
    if (!PAYMENT_DEPENDENT_STATUSES.includes(newStatus)) {
        return { isValid: true, message: null };
    }

    // COD orders bypass payment requirements
    if (paymentMethod === 'COD') {
        return { isValid: true, message: null };
    }

    // Other payment methods require payment
    if (!isPaid) {
        const statusAction = newStatus === 'delivering' ? 'start delivery' : 'mark as delivered';
        const statusName = newStatus === 'delivering' ? 'delivering' : 'delivered';
        
        return {
            isValid: false,
            message: `Order must be paid before you can ${statusAction}. Only COD orders can be marked as ${statusName} without payment.`
        };
    }

    return { isValid: true, message: null };
};
```

### Backend Validation (`adminController.js`)

```javascript
// Server-side validation for order status updates
if ((status === 'delivering' || status === 'delivered') && 
    currentOrder.paymentMethod !== 'COD' && 
    !currentOrder.isPaid) {
    
    const statusAction = status === 'delivering' ? 'start delivery' : 'mark as delivered';
    const statusName = status === 'delivering' ? 'delivering' : 'delivered';
    
    return errorResponse(
        res, 
        `Order must be paid before you can ${statusAction}. Only COD orders can be marked as ${statusName} without payment.`, 
        400
    );
}
```

## Visual Indicators

### COD Badge
- **Green badge** with 💰 icon appears next to order status
- **Tooltip**: "COD orders can be delivered without payment"
- **Responsive sizing** for different component sizes

### Error Messages
- **Specific messages** for `delivering` vs `delivered` status
- **Clear explanation** of COD exception
- **Multilingual support** (English/Vietnamese)

## Status Flow Examples

### Non-COD Order (Credit Card)
```
pending → processing → [PAYMENT REQUIRED] → delivering → delivered
                      ↑
                   Must be paid first
```

### COD Order
```
pending → processing → delivering → delivered
                      ↑           ↑
                   No payment   Payment collected
                   required     on delivery
```

## Error Messages

### English
- **Delivering**: "Order must be paid before you can start delivery. Only COD orders can be marked as delivering without payment."
- **Delivered**: "Order must be paid before you can mark as delivered. Only COD orders can be marked as delivered without payment."

### Vietnamese
- **Delivering**: "Đơn hàng phải được thanh toán trước khi bắt đầu giao hàng. Chỉ đơn hàng COD mới có thể chuyển sang trạng thái đang giao mà không cần thanh toán."
- **Delivered**: "Đơn hàng phải được thanh toán trước khi đánh dấu đã giao. Chỉ đơn hàng COD mới có thể đánh dấu đã giao mà không cần thanh toán."

## Payment Methods

### Supported Payment Methods
- **COD** - Cash on Delivery (special privileges)
- **CREDIT_CARD** - Credit/Debit Card (requires payment)
- **PAYPAL** - PayPal (requires payment)
- **BANK_TRANSFER** - Bank Transfer (requires payment)

### COD Detection
```javascript
// Check if order is COD
const isCOD = paymentMethod === 'COD';

// Apply COD-specific logic
if (isCOD) {
    // Allow status change without payment
    return { isValid: true };
}
```

## Security Considerations

### Double Validation
- **Frontend validation** for immediate user feedback
- **Backend validation** for security and data integrity
- **Consistent logic** between frontend and backend

### API Protection
- Server-side validation prevents direct API manipulation
- Proper error responses with meaningful messages
- Audit logging for all status changes

## Testing Scenarios

### Test Cases
1. **COD Order → Delivering (Unpaid)** ✅ Should succeed
2. **COD Order → Delivered (Unpaid)** ✅ Should succeed
3. **Credit Card Order → Delivering (Unpaid)** ❌ Should fail
4. **Credit Card Order → Delivered (Unpaid)** ❌ Should fail
5. **Credit Card Order → Delivering (Paid)** ✅ Should succeed
6. **Credit Card Order → Delivered (Paid)** ✅ Should succeed

### Manual Testing
1. Create orders with different payment methods
2. Try to change status to `delivering`/`delivered`
3. Verify COD orders work without payment
4. Verify non-COD orders require payment
5. Check error messages are displayed correctly

## Benefits

### Business Logic Alignment
- **Reflects real-world** COD business practices
- **Prevents errors** in order fulfillment
- **Maintains data integrity** across payment methods

### User Experience
- **Clear visual indicators** for COD orders
- **Helpful error messages** explaining requirements
- **Consistent behavior** across the application

### Operational Efficiency
- **Reduces confusion** for admin users
- **Prevents invalid** status transitions
- **Streamlines** order management workflow

This implementation ensures that the order management system properly handles the unique requirements of COD orders while maintaining strict validation for other payment methods.
