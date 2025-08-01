import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Newsletter.css';

const Newsletter = () => {
    const { t } = useTranslation();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email(t('validation.email.invalid'))
            .required(t('validation.email.required')),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // TODO: Implement newsletter subscription API call
            console.log('Newsletter subscription:', values.email);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setIsSubmitted(true);
            resetForm();

            // Reset success message after 3 seconds
            setTimeout(() => setIsSubmitted(false), 3000);
        } catch (error) {
            console.error('Newsletter subscription error:', error);
        }
        setSubmitting(false);
    };

    return (
        <section className="newsletter">
            <div className="newsletter-container">
                <div className="newsletter-content">
                    <div className="newsletter-text">
                        <h2 className="newsletter-title">{t('newsletter.title')}</h2>
                        <p className="newsletter-description">{t('newsletter.description')}</p>
                    </div>

                    <div className="newsletter-form-container">
                        {isSubmitted ? (
                            <div className="newsletter-success">
                                <div className="success-icon">✓</div>
                                <p>{t('newsletter.success')}</p>
                            </div>
                        ) : (
                            <Formik
                                initialValues={{ email: '' }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="newsletter-form">
                                        <div className="form-group">
                                            <Field
                                                type="email"
                                                name="email"
                                                placeholder={t('newsletter.placeholder')}
                                                className="newsletter-input"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="newsletter-button"
                                            >
                                                {isSubmitting
                                                    ? t('newsletter.submitting')
                                                    : t('newsletter.subscribe')}
                                            </button>
                                        </div>
                                        <ErrorMessage
                                            name="email"
                                            component="div"
                                            className="error-message"
                                        />
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
