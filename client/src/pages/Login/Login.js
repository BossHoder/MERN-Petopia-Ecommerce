import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';

import { useFormik } from 'formik';

import { connect } from 'react-redux';

import { loginUserWithEmail } from '../../store/actions/authActions';
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from '../../constants';
import { loginSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Login = ({ auth, loginUserWithEmail }) => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: (values) => {
            loginUserWithEmail(values, navigate);
        },
    });

    if (auth.isAuthenticated) return <Navigate to="/" replace />;
    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Back to Home Link */}
                <div className="auth-back">
                    <Link to="/" className="back-link">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                        {t('navigation.home')}
                    </Link>
                </div>

                <div className="auth-card">
                    {/* Header */}
                    <div className="auth-header">
                        <h1 className="auth-title">{t('auth.login.title')}</h1>
                    </div>

                    <form onSubmit={formik.handleSubmit} noValidate className="auth-form">
                        {/* Social Login */}
                        <div className="social-login">
                            <div className="social-buttons">
                                <a className="social-btn facebook-btn" href={FACEBOOK_AUTH_LINK}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    {t('auth.login.facebook')}
                                </a>
                                <a className="social-btn google-btn" href={GOOGLE_AUTH_LINK}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    </svg>
                                    {t('auth.login.google')}
                                </a>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                {t('auth.login.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`form-input ${
                                    formik.touched.email && formik.errors.email ? 'error' : ''
                                }`}
                                placeholder={t('auth.login.email')}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="error-message">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                {t('auth.login.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={`form-input ${
                                    formik.touched.password && formik.errors.password ? 'error' : ''
                                }`}
                                placeholder={t('auth.login.password')}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-message">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Login Error */}
                        {auth.error && (
                            <div className="auth-error">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {auth.error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`auth-submit-btn ${auth.isLoading ? 'loading' : ''}`}
                            disabled={auth.isLoading || !formik.isValid}
                        >
                            {auth.isLoading ? (
                                <>
                                    <svg
                                        className="spinner"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.93 0 1.82.14 2.66.4" />
                                    </svg>
                                    {t('auth.login.submitting', 'Đang đăng nhập...')}
                                </>
                            ) : (
                                t('auth.login.submit')
                            )}
                        </button>

                        {/* Footer */}
                        <div className="auth-footer">
                            <p>
                                {t('auth.login.noAccount')}{' '}
                                <Link to="/register" className="auth-link">
                                    {t('auth.register.title')}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors,
});

export default connect(mapStateToProps, { loginUserWithEmail })(Login);
