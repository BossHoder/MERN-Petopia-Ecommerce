# Toast Utilities Documentation

## Overview
Enhanced toast notification system with duplicate prevention and auto-reload functionality for the Petopia admin panel.

## Features

### 🚫 **Duplicate Prevention**
- Prevents multiple identical toasts from showing simultaneously
- Uses message-based deduplication with type prefixes
- Automatically cleans up when toasts are dismissed

### 🔄 **Auto-Reload Functionality**
- Automatically reloads data after successful operations
- Configurable delay (default: 1.5 seconds)
- Visual indicator with special CSS class

### 🎨 **Enhanced Styling**
- Pet-friendly color scheme matching brand guidelines
- Gradient backgrounds and border accents
- Mobile-responsive design
- Smooth animations

## API Reference

### Basic Toast Functions

```javascript
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '../utils/toastUtils';

// Success toast
showSuccessToast('Operation completed successfully');

// Error toast
showErrorToast('Something went wrong');

// Info toast
showInfoToast('Information message');

// Warning toast
showWarningToast('Warning message');
```

### Auto-Reload Toast

```javascript
import { showToastWithReload } from '../utils/toastUtils';

// Show toast with auto-reload
showToastWithReload(
    'Order status updated successfully',
    'success',
    reloadFunction,
    1500 // delay in milliseconds
);
```

### Utility Functions

```javascript
import { clearAllToasts, isToastActive } from '../utils/toastUtils';

// Clear all active toasts
clearAllToasts();

// Check if a specific toast is active
const isActive = isToastActive('Order updated', 'success');
```

## Usage Examples

### In Order Management

```javascript
const handleUpdateStatus = async (orderId, newStatus) => {
    try {
        await dispatch(updateOrderStatus(orderId, newStatus));
        
        // Show success toast with auto-reload
        showToastWithReload(
            t('admin.orders.statusUpdateSuccess', 'Order status updated successfully'),
            'success',
            reloadOrders,
            1500
        );
    } catch (error) {
        // Show error toast (no reload)
        showErrorToast(t('admin.orders.statusUpdateError', 'Failed to update order status'));
    }
};
```

### Custom Options

```javascript
showToastWithReload(
    'Custom message',
    'success',
    reloadFunction,
    2000, // 2 second delay
    {
        autoClose: 4000, // Toast stays for 4 seconds
        position: 'top-right',
        className: 'custom-toast-class',
        onClose: () => console.log('Toast closed')
    }
);
```

## Configuration

### Default Settings
- **Success toasts**: 3 second duration
- **Error toasts**: 5 second duration
- **Info/Warning toasts**: 4 second duration
- **Auto-reload delay**: 1.5 seconds

### CSS Classes
- `.toast-with-reload`: Applied to auto-reload toasts
- `.Toastify__toast--success`: Success toast styling
- `.Toastify__toast--error`: Error toast styling
- `.Toastify__toast--warning`: Warning toast styling
- `.Toastify__toast--info`: Info toast styling

## Implementation Details

### Duplicate Prevention Logic
1. Each toast message gets a unique key: `${type}_${message}`
2. Active toasts are tracked in a Set
3. Duplicate messages are ignored while active
4. Keys are cleaned up when toasts close

### Auto-Reload Flow
1. Toast is displayed with special CSS class
2. Timer is set for the specified delay
3. Reload function is called after delay
4. Visual indicator shows "Auto-reloading..." text

### Error Handling
- Toast utilities never throw errors
- Failed toast creation returns `null`
- Main operations continue even if toasts fail
- Console warnings for debugging

## Best Practices

### ✅ Do
- Use appropriate toast types (success, error, info, warning)
- Provide meaningful messages with i18n support
- Use auto-reload for data-changing operations
- Keep messages concise and clear

### ❌ Don't
- Show multiple toasts for the same action
- Use very long messages
- Set extremely short auto-reload delays
- Forget to handle errors appropriately

## Troubleshooting

### Common Issues

**Toast not showing:**
- Check if duplicate prevention is blocking it
- Verify toast container is rendered
- Check console for errors

**Auto-reload not working:**
- Ensure reload function is provided
- Check if toast was actually created (not blocked)
- Verify delay timing

**Styling issues:**
- Ensure `toastStyles.css` is imported
- Check CSS class names
- Verify CSS variables are defined

### Debug Mode
```javascript
// Check active toasts
console.log('Active toasts:', activeToasts);

// Force clear all toasts
clearAllToasts();
```

## Integration with Admin Orders

The toast utilities are fully integrated with the admin orders management system:

- **Status updates**: Auto-reload orders list after status changes
- **Payment updates**: Auto-reload after payment status changes
- **Error handling**: Clear error messages without reload
- **Duplicate prevention**: Prevents spam from rapid clicking

This ensures a smooth user experience with immediate feedback and up-to-date data display.
