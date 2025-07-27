import React from 'react';
import { useTranslation } from 'react-i18next';
import './BrandPromise.css';

const BrandPromise = () => {
    const { t } = useTranslation();

    const promises = [
        {
            id: 'safety',
            icon: '🛡️',
            title: t('brandPromise.safety.title'),
            description: t('brandPromise.safety.desc'),
        },
        {
            id: 'delivery',
            icon: '🚚',
            title: t('brandPromise.delivery.title'),
            description: t('brandPromise.delivery.desc'),
        },
        {
            id: 'support',
            icon: '💬',
            title: t('brandPromise.support.title'),
            description: t('brandPromise.support.desc'),
        },
        {
            id: 'reviews',
            icon: '⭐',
            title: t('brandPromise.reviews.title'),
            description: t('brandPromise.reviews.desc'),
        },
    ];

    return (
        <section className="brand-promise">
            <div className="brand-promise-container">
                <div className="brand-promise-header">
                    <h2 className="brand-promise-title">{t('brandPromise.title')}</h2>
                    <p className="brand-promise-subtitle">{t('brandPromise.subtitle')}</p>
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
