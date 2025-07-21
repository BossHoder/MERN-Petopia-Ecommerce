import React from 'react';
import { useTranslation } from 'react-i18next';
import './BrandPromise.css';

const BrandPromise = () => {
    const { t } = useTranslation();

    const promises = [
        {
            id: 'safety',
            icon: '🛡️',
            title: t('brandPromise.safety.title', 'An Toàn & Chất Lượng'),
            description: t(
                'brandPromise.safety.desc',
                'Tất cả sản phẩm được kiểm tra chất lượng nghiêm ngặt',
            ),
        },
        {
            id: 'delivery',
            icon: '🚚',
            title: t('brandPromise.delivery.title', 'Giao Hàng Nhanh'),
            description: t('brandPromise.delivery.desc', 'Giao hàng toàn quốc trong 1-3 ngày'),
        },
        {
            id: 'support',
            icon: '💬',
            title: t('brandPromise.support.title', 'Hỗ Trợ 24/7'),
            description: t(
                'brandPromise.support.desc',
                'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ',
            ),
        },
        {
            id: 'reviews',
            icon: '⭐',
            title: t('brandPromise.reviews.title', 'Đánh Giá Tích Cực'),
            description: t(
                'brandPromise.reviews.desc',
                'Hàng ngàn khách hàng hài lòng và tin tưởng',
            ),
        },
    ];

    return (
        <section className="brand-promise">
            <div className="brand-promise-container">
                <div className="brand-promise-header">
                    <h2 className="brand-promise-title">
                        {t('brandPromise.title', 'Tại Sao Chọn Petopia?')}
                    </h2>
                    <p className="brand-promise-subtitle">
                        {t(
                            'brandPromise.subtitle',
                            'Cam kết mang đến trải nghiệm mua sắm tốt nhất cho bạn và thú cưng',
                        )}
                    </p>
                </div>

                <div className="brand-promise-grid">
                    {promises.map((promise) => (
                        <div key={promise.id} className="promise-card">
                            <div className="promise-icon">{promise.icon}</div>
                            <h3 className="promise-title">{promise.title}</h3>
                            <p className="promise-description">{promise.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandPromise;
