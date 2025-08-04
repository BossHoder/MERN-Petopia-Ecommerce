# Enhanced Analytics System

## Tổng quan

Hệ thống Enhanced Analytics được thiết kế để cung cấp các tính năng analytics hiện đại cho ecommerce platform, tương tự như các dự án lớn trên GitHub như Reaction Commerce, EverShop, và Vercel Commerce.

## Tính năng chính

### 1. **Multi-Platform Analytics Tracking**
- ✅ Google Analytics 4
- ✅ Mixpanel
- ✅ Amplitude
- ✅ Segment
- ✅ Hotjar
- ✅ Custom Backend Analytics

### 2. **A/B Testing Framework**
- Tạo và quản lý A/B tests
- Hash-based variant assignment
- Statistical significance testing
- Real-time results tracking

### 3. **Customer Journey Tracking**
- Touchpoint tracking
- Journey stage identification
- Conversion path analysis
- Session duration tracking

### 4. **Predictive Analytics**
- Customer Lifetime Value (LTV) prediction
- Churn prediction
- Product recommendations
- Customer segmentation

### 5. **Business Intelligence**
- Advanced revenue analytics
- Customer behavior analysis
- Real-time dashboard
- Custom reporting

## Cài đặt

### 1. **Backend Dependencies**

```bash
cd server
npm install @amplitude/analytics-node @segment/analytics-node mixpanel
```

### 2. **Environment Variables**

Thêm vào file `.env`:

```env
# External Analytics Services
MIXPANEL_TOKEN=your_mixpanel_token
AMPLITUDE_API_KEY=your_amplitude_api_key
SEGMENT_WRITE_KEY=your_segment_write_key

# Google Analytics
GA_MEASUREMENT_ID=your_ga_measurement_id
```

### 3. **Frontend Integration**

Thêm các script tags vào `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Mixpanel -->
<script>
  (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0));for(var c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
mixpanel.init("YOUR_MIXPANEL_TOKEN");
</script>

<!-- Amplitude -->
<script type="text/javascript">
  (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
  ;r.type="text/javascript"
  ;r.integrity="sha384-tzcaaCH5+KXD4sGaDozev6oElQhsVfbJvdi7/8bLbwXYTpLc4zJ4QdNc2W+VmQj"
  ;r.crossOrigin="anonymous";r.async=true
  ;r.src="https://cdn.amplitude.com/libs/amplitude-8.5.0-min.gz.js"
  ;r.onload=function(){if(!e.amplitude.runQueuedFunctions){
  console.log("[Amplitude] Error: could not load SDK")}}
  ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
  ;function s(e,t){e.prototype[t]=function(){
  this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
  var o=function(){this._q=[];return this}
  ;var a=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove"]
  ;for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[]
  ;return this}
  ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
  ;for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u
  ;var d=["init","logEvent","logEventWithTimestamp","logEventWithGroups","setGroup","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenue","setProductId","setQuantity","setPrice","setRevenueType","setEventProperties","resetUserId","setDeviceId","enableTracking","setGlobalUserProperties","clearUserProperties","setVersionName","setDomain","setOptOut","setEventUploadThreshold","setUseDynamicConfig","setServerUrl","sendEvents","setLibrary","resetSessionId","getSessionId","setMinTimeBetweenSessionsMillis","setEventUploadThreshold","setUseDynamicConfig","setServerUrl","sendEvents","setLibrary","resetSessionId","getSessionId","setMinTimeBetweenSessionsMillis"]
  ;function v(e){function t(t){e[t]=function(){
  e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
  for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
  e=(!e||e.length===0?"$default_instance":e).toLowerCase()
  ;if(!Object.prototype.hasOwnProperty.call(n._iq,e)){n._iq[e]={_q:[]};v(n._iq[e])
  }return n._iq[e]};e.amplitude=n})(window,document);
  amplitude.getInstance().init("YOUR_AMPLITUDE_API_KEY");
</script>

<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.2";
  analytics.load("YOUR_SEGMENT_WRITE_KEY");
  analytics.page();
  }}();
</script>

<!-- Hotjar -->
<script>
  (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

## Sử dụng

### 1. **Basic Event Tracking**

```javascript
import enhancedAnalytics from '../utils/enhancedAnalytics';

// Track product view
enhancedAnalytics.trackProductView(product, {
    category: 'pets',
    source: 'search'
});

// Track add to cart
enhancedAnalytics.trackAddToCart(product, {
    cart_value: cartTotal,
    items_in_cart: cartItems.length
});

// Track purchase
enhancedAnalytics.trackPurchase(purchaseData, {
    payment_method: 'stripe',
    shipping_method: 'express'
});
```

### 2. **A/B Testing**

```javascript
// Get A/B test variant
const variant = await enhancedAnalytics.getABTestVariant('button-color-test');

// Track A/B test exposure
enhancedAnalytics.trackABTestExposure('button-color-test', variant, {
    page: 'product-detail'
});

// Apply variant
if (variant === 'blue') {
    button.style.backgroundColor = '#007bff';
} else {
    button.style.backgroundColor = '#28a745';
}
```

### 3. **Customer Insights**

```javascript
// Get customer insights
const insights = await enhancedAnalytics.getCustomerInsights();
console.log('Customer LTV:', insights.ltv.predictedLTV);
console.log('Churn Risk:', insights.churn.churnRisk);

// Get product recommendations
const recommendations = await enhancedAnalytics.getProductRecommendations(5);
```

### 4. **Performance Tracking**

```javascript
// Track performance metrics
enhancedAnalytics.trackPerformance({
    loadTime: 1200,
    fcp: 800,
    lcp: 1500,
    fid: 50,
    cls: 0.1
});
```

## API Endpoints

### Public Endpoints

```
POST /api/enhanced-analytics/track
GET  /api/enhanced-analytics/ab-test/:testId
```

### Protected Endpoints

```
GET  /api/enhanced-analytics/customer-insights/:userId
GET  /api/enhanced-analytics/recommendations/:userId
GET  /api/enhanced-analytics/customer-ltv/:userId
GET  /api/enhanced-analytics/churn-prediction/:userId
GET  /api/enhanced-analytics/customer-journey/:userId/:sessionId
```

### Admin Endpoints

```
GET  /api/enhanced-analytics/business-intelligence
GET  /api/enhanced-analytics/ltv-analysis
GET  /api/enhanced-analytics/churn-analysis
GET  /api/enhanced-analytics/journey-analytics
GET  /api/enhanced-analytics/real-time-activity
POST /api/enhanced-analytics/ab-test
```

## So sánh với các dự án lớn

### **Reaction Commerce**
- ✅ Microservices architecture
- ✅ Event-driven analytics
- ✅ GraphQL integration
- ✅ Multi-platform tracking

### **EverShop**
- ✅ TypeScript implementation
- ✅ Built-in analytics module
- ✅ Advanced aggregation queries
- ✅ Real-time tracking

### **Vercel Commerce**
- ✅ Next.js integration
- ✅ Performance monitoring
- ✅ Headless architecture
- ✅ Modern analytics stack

## Lợi ích

1. **Comprehensive Tracking**: Theo dõi toàn diện hành vi khách hàng
2. **Predictive Insights**: Dự đoán LTV và churn risk
3. **A/B Testing**: Tối ưu hóa conversion rate
4. **Multi-Platform**: Tích hợp nhiều analytics platforms
5. **Real-time Analytics**: Dữ liệu real-time cho decision making
6. **Scalable Architecture**: Kiến trúc có thể mở rộng
7. **Modern Stack**: Sử dụng công nghệ hiện đại

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Conversion Rate**: Tỷ lệ chuyển đổi
2. **Customer LTV**: Giá trị khách hàng trọn đời
3. **Churn Rate**: Tỷ lệ rời bỏ
4. **A/B Test Performance**: Hiệu suất A/B test
5. **System Performance**: Hiệu suất hệ thống

### Alert Thresholds

```javascript
// Example alert configuration
const alerts = {
    conversionRate: { threshold: 2.5, operator: '<' },
    churnRate: { threshold: 5, operator: '>' },
    systemError: { threshold: 1, operator: '>' }
};
```

## Troubleshooting

### Common Issues

1. **External Analytics Not Loading**
   - Check API keys in environment variables
   - Verify network connectivity
   - Check browser console for errors

2. **A/B Test Not Working**
   - Verify test is active
   - Check user assignment logic
   - Validate test configuration

3. **Performance Issues**
   - Monitor database queries
   - Check aggregation pipeline performance
   - Optimize indexes

## Future Enhancements

1. **Machine Learning Integration**
   - Advanced recommendation algorithms
   - Predictive modeling
   - Automated insights

2. **Real-time Dashboard**
   - WebSocket integration
   - Live data visualization
   - Interactive charts

3. **Advanced Segmentation**
   - Behavioral segmentation
   - RFM analysis
   - Cohort analysis

4. **Marketing Automation**
   - Triggered campaigns
   - Personalized content
   - Email automation

## Support

Để được hỗ trợ hoặc báo cáo lỗi, vui lòng tạo issue trên GitHub repository.