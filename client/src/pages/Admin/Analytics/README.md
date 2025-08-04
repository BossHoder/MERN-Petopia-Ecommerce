# Analytics Dashboard with Tabs System

## Overview

Trang analytics hiện đã được nâng cấp từ single-page layout sang hệ thống tabs hiện đại, tương tự các website ecommerce chuyên nghiệp như Shopify, Amazon Admin.

## Features

### 🔥 Tab-based Navigation

-   **Overview**: Tổng quan chung với KPIs quan trọng nhất
-   **Sales**: Phân tích doanh thu, performance, goals
-   **Orders**: Quản lý và phân tích đơn hàng
-   **Products**: Hiệu suất sản phẩm, inventory, categories
-   **Customers**: Phân tích khách hàng, segments, behavior
-   **Conversion**: Funnel analysis, optimization insights

### 📱 URL Routing

```
/admin/analytics?tab=overview    # Default tab
/admin/analytics?tab=sales       # Sales analytics
/admin/analytics?tab=orders      # Orders analytics
/admin/analytics?tab=products    # Products analytics
/admin/analytics?tab=customers   # Customer analytics
/admin/analytics?tab=conversion  # Conversion analytics
```

### 🎨 Modern UI Components

-   **Responsive design** với mobile support
-   **Interactive elements** với hover states
-   **Professional color scheme** theo brand guidelines
-   **Progress bars** và **trend indicators**
-   **Data visualizations** với charts và graphs

## Tab Details

### 1. Overview Tab (`?tab=overview`)

-   **Real-time activity**: Active users, events, signups
-   **Key performance indicators**: Revenue, orders, customers, conversion
-   **Quick insights**: Automated insights và recommendations

### 2. Sales Tab (`?tab=sales`)

-   **Revenue analytics**: Total, gross, net revenue
-   **Sales performance**: Daily, weekly, monthly trends
-   **Sales breakdown**: By category, payment method
-   **Sales goals**: Progress tracking với visual indicators

### 3. Orders Tab (`?tab=orders`)

-   **Order statistics**: Total, completed, pending, cancelled
-   **Order performance**: AOV, frequency, fulfillment rate
-   **Status breakdown**: Processing, shipped, delivered
-   **Recent orders**: Real-time order list
-   **Order insights**: Peak hours, patterns

### 4. Products Tab (`?tab=products`)

-   **Product overview**: Total products, stock levels
-   **Top selling products**: Ranking table với growth metrics
-   **Category performance**: Breakdown by pet types
-   **Stock management**: Urgent restock alerts
-   **Product insights**: Trending products, recommendations

### 5. Customers Tab (`?tab=customers`)

-   **Customer overview**: New customers, retention, LTV
-   **Acquisition channels**: Organic, social, email, paid ads
-   **Customer demographics**: Age groups với visual bars
-   **Customer behavior**: Purchase patterns, satisfaction ratings
-   **Customer segments**: VIP, loyal, regular, new customers

### 6. Conversion Tab (`?tab=conversion`)

-   **Conversion overview**: Overall rates và efficiency
-   **Conversion funnel**: Step-by-step analysis
-   **Channel performance**: Conversion by traffic source
-   **Device analytics**: Mobile vs desktop performance
-   **Optimization insights**: Areas for improvement

## Technical Implementation

### Component Structure

```
components/Admin/
├── TabNavigation/
│   ├── TabNavigation.js
│   ├── TabNavigation.css
│   └── index.js
└── AnalyticsTabs/
    ├── OverviewTab.js
    ├── SalesTab.js
    ├── OrdersTab.js
    ├── ProductsTab.js
    ├── CustomersTab.js
    ├── ConversionTab.js
    └── index.js
```

### URL State Management

```javascript
// URL params handling
const searchParams = new URLSearchParams(location.search);
const activeTab = searchParams.get('tab') || 'overview';

// Tab navigation
const handleTabChange = (tabId) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', tabId);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
};
```

### Tab Configuration

```javascript
const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'conversion', label: 'Conversion', icon: '🎯' },
];
```

## Best Practices Applied

### 1. **Shopify-inspired Design**

-   Tab navigation với clear active states
-   Card-based layouts cho từng metric
-   Consistent spacing và typography
-   Professional color palette

### 2. **Progressive Data Loading**

-   Lazy loading cho tab content
-   Shared data giữa các tabs
-   Efficient API calls

### 3. **Mobile-first Approach**

-   Responsive tab navigation
-   Mobile-optimized layouts
-   Touch-friendly interactions

### 4. **Performance Optimization**

-   Component-based architecture
-   Efficient re-renders
-   Optimized bundle size

## Usage Examples

### Accessing Specific Tabs

```javascript
// Navigate to sales tab programmatically
navigate('/admin/analytics?tab=sales');

// Check current tab
const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
```

### Adding New Tabs

1. Create new tab component in `AnalyticsTabs/`
2. Add tab configuration in `Analytics.js`
3. Update `renderTabContent()` function
4. Add corresponding CSS styles

### Customizing Tab Content

```javascript
// Example: Adding new metrics to SalesTab
<StatsCard title="New Metric" value={data.newMetric} icon="📈" color="primary" />
```

## Browser Compatibility

-   ✅ Chrome 90+
-   ✅ Firefox 88+
-   ✅ Safari 14+
-   ✅ Edge 90+
-   ✅ Mobile browsers

## Next Steps

-   [ ] Add export functionality for each tab
-   [ ] Implement real-time updates
-   [ ] Add more interactive charts
-   [ ] Create custom date range picker
-   [ ] Add comparison features
