# 🌍 Hướng dẫn sử dụng đa ngôn ngữ (i18n) trong dự án

## 📖 Tổng quan

Dự án sử dụng **react-i18next** để hỗ trợ đa ngôn ngữ (Tiếng Việt và Tiếng Anh). Đây là giải pháp đơn giản, dễ hiểu và thân thiện với fresher/junior.

## 🚀 Cách sử dụng cơ bản

### 1. Import và sử dụng hook useI18n

```javascript
import { useI18n } from '../hooks/useI18n';

const MyComponent = () => {
    const { t } = useI18n();

    return (
        <div>
            <h1>{t('navigation.home')}</h1>
            <p>{t('app.subtitle')}</p>
        </div>
    );
};
```

### 2. Sử dụng trực tiếp react-i18next

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('navigation.home')}</h1>
        </div>
    );
};
```

## 📁 Cấu trúc thư mục

```
src/
├── i18n/
│   ├── i18n.js                 # Cấu hình chính
│   └── locales/
│       ├── en/
│       │   └── common.json     # Bản dịch tiếng Anh
│       └── vi/
│           └── common.json     # Bản dịch tiếng Việt
├── hooks/
│   └── useI18n.js             # Custom hook
└── components/
    └── LanguageSelector/      # Component chuyển đổi ngôn ngữ
```

## ⚙️ Cách thêm bản dịch mới

### 1. Thêm vào file JSON

**en/common.json:**

```json
{
    "products": {
        "title": "Products",
        "newField": "New Field"
    }
}
```

**vi/common.json:**

```json
{
    "products": {
        "title": "Sản phẩm",
        "newField": "Trường mới"
    }
}
```

### 2. Sử dụng trong component

```javascript
const ProductPage = () => {
    const { t } = useI18n();

    return (
        <div>
            <h1>{t('products.title')}</h1>
            <p>{t('products.newField')}</p>
        </div>
    );
};
```

## 🎯 Các tính năng của custom hook useI18n

```javascript
const {
    t, // Function translate
    currentLanguage, // Ngôn ngữ hiện tại ('en' hoặc 'vi')
    changeLanguage, // Function đổi ngôn ngữ
    isVietnamese, // true nếu đang dùng tiếng Việt
    isEnglish, // true nếu đang dùng tiếng Anh
    formatText, // Function format text theo ngôn ngữ
    textDirection, // Hướng text ('ltr' hoặc 'rtl')
} = useI18n();
```

## 💡 Ví dụ thực tế

### 1. Trang Login

```javascript
const LoginPage = () => {
    const { t } = useI18n();

    return (
        <form>
            <h1>{t('auth.login.title')}</h1>
            <input placeholder={t('auth.login.email')} />
            <input placeholder={t('auth.login.password')} />
            <button>{t('auth.login.submit')}</button>
        </form>
    );
};
```

### 2. Component với logic theo ngôn ngữ

```javascript
const ProductCard = ({ product }) => {
    const { t, isVietnamese } = useI18n();

    const formatPrice = (price) => {
        return isVietnamese ? `${price.toLocaleString('vi-VN')} đ` : `$${price}`;
    };

    return (
        <div>
            <h3>{product.name}</h3>
            <p>
                {t('products.price')}: {formatPrice(product.price)}
            </p>
        </div>
    );
};
```

### 3. Conditional rendering theo ngôn ngữ

```javascript
const NewsSection = () => {
    const { isVietnamese, t } = useI18n();

    return (
        <div>
            <h2>{t('news.title')}</h2>
            {isVietnamese ? (
                <p>Tin tức về thú cưng tại Việt Nam</p>
            ) : (
                <p>Pet news around the world</p>
            )}
        </div>
    );
};
```

## 🔧 Cấu hình nâng cao

### 1. Thêm ngôn ngữ mới (ví dụ: tiếng Nhật)

1. Tạo thư mục `src/i18n/locales/ja/`
2. Tạo file `common.json` với bản dịch tiếng Nhật
3. Cập nhật `i18n.js`:

```javascript
import jaTranslations from './locales/ja/common.json';

const resources = {
    en: { common: enTranslations },
    vi: { common: viTranslations },
    ja: { common: jaTranslations }, // Thêm dòng này
};
```

4. Cập nhật LanguageSelector component

### 2. Thêm namespace mới

Khi project lớn, có thể tách bản dịch theo namespace:

**Cấu trúc:**

```
locales/
├── en/
│   ├── common.json
│   ├── products.json
│   └── auth.json
└── vi/
    ├── common.json
    ├── products.json
    └── auth.json
```

**Sử dụng:**

```javascript
const { t } = useTranslation('products'); // Chỉ định namespace
return <h1>{t('title')}</h1>; // Sẽ lấy từ products.json
```

## ✅ Best Practices

### 1. Quy tắc đặt tên key

-   Dùng cấu trúc hierarchical: `section.subsection.key`
-   Tên key nên mô tả rõ ràng: `auth.login.emailPlaceholder`
-   Avoid viết tắt: `navigation` thay vì `nav`

### 2. Tổ chức bản dịch

```json
{
  "navigation": { "Tất cả liên quan navigation" },
  "auth": { "Tất cả liên quan authentication" },
  "products": { "Tất cả liên quan products" },
  "common": { "Các từ dùng chung như Save, Cancel, etc" }
}
```

### 3. Handle missing translations

```javascript
// Cung cấp fallback
const title = t('products.title', 'Default Title');

// Hoặc check trước khi dùng
const { exists } = useTranslation();
if (exists('products.newFeature')) {
    // Hiển thị tính năng mới
}
```

## 🐛 Troubleshooting

### 1. Bản dịch không hiển thị

-   Check xem key có đúng không
-   Check xem file JSON có lỗi syntax không
-   Check console để xem warning từ i18next

### 2. Ngôn ngữ không thay đổi

-   Check localStorage có lưu language preference không
-   Check component có re-render sau khi đổi ngôn ngữ không

### 3. Performance issues

-   Lazy load translations nếu có quá nhiều text
-   Dùng namespace để tách nhỏ

## 📚 Tài liệu tham khảo

-   [React-i18next Official Docs](https://react.i18next.com/)
-   [i18next Official Docs](https://www.i18next.com/)

---

**Lưu ý:** Đây là implementation đơn giản phù hợp với project cá nhân và team nhỏ. Khi project phát triển lớn hơn, có thể cần optimization thêm.
