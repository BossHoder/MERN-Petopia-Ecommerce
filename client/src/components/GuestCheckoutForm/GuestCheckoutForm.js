import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './GuestCheckoutForm.css';

const GuestCheckoutForm = ({ onSubmit, initialData = {} }) => {
    const { t } = useTranslation('common');
    const [formData, setFormData] = useState({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        address: initialData.address || '',
        city: initialData.city || '',
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('checkout.guest.errors.fullNameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('checkout.guest.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('checkout.guest.errors.emailInvalid');
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t('checkout.guest.errors.phoneRequired');
        } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = t('checkout.guest.errors.phoneInvalid');
        }

        if (!formData.address.trim()) {
            newErrors.address = t('checkout.guest.errors.addressRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="guest-checkout-form">
            <h3>{t('checkout.guest.title')}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fullName">{t('checkout.guest.fullName')} *</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? 'error' : ''}
                            placeholder={t('checkout.guest.fullNamePlaceholder')}
                        />
                        {errors.fullName && (
                            <span className="error-message">{errors.fullName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">{t('checkout.guest.email')} *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder={t('checkout.guest.emailPlaceholder')}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phoneNumber">{t('checkout.guest.phoneNumber')} *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={errors.phoneNumber ? 'error' : ''}
                            placeholder={t('checkout.guest.phonePlaceholder')}
                        />
                        {errors.phoneNumber && (
                            <span className="error-message">{errors.phoneNumber}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">{t('checkout.guest.city')}</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder={t('checkout.guest.cityPlaceholder')}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="address">{t('checkout.guest.address')} *</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={errors.address ? 'error' : ''}
                        placeholder={t('checkout.guest.addressPlaceholder')}
                        rows="3"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="guest-checkout-actions">
                    <button type="submit" className="btn btn-primary">
                        {t('checkout.guest.continue')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GuestCheckoutForm;
