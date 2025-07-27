import React from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';

import { useFormik } from 'formik';

import { connect } from 'react-redux';

import { loginUserWithEmail } from '../../store/actions/authActions';
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from '../../constants';
import { getLoginSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Login = ({ auth, loginUserWithEmail }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/';

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: getLoginSchema(t),
        onSubmit: (values) => {
            // Tạo custom navigate function với redirect path
            const customNavigate = (path) => {
                if (path === '/') {
                    navigate(redirectPath, { replace: true });
                } else {
                    navigate(path, { replace: true });
                }
            };
            loginUserWithEmail(values, customNavigate);
        },
    });

    if (auth.isAuthenticated) return <Navigate to={redirectPath} replace />;

    return (
        <div className="petopia-login-page">
            {/* Hero Section - Left Side */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">{t('auth.hero.welcomeTitle')}</h1>
                        <p className="hero-subtitle">{t('auth.hero.welcomeSubtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side */}
            <div className="form-section">
                <div className="form-container">
                    <div className="login-card">
                        <h2 className="login-title">{t('auth.login.title')}</h2>
                        <p className="login-subtitle">{t('auth.login.subtitle')}</p>

                        <form onSubmit={formik.handleSubmit} noValidate className="petopia-form">
                            {/* Email Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    {t('auth.login.email')}
                                </label>
                                <input
                                    className={`form-input ${
                                        formik.touched.email && formik.errors.email ? 'error' : ''
                                    }`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.login.emailPlaceholder')}
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-describedby={
                                        formik.touched.email && formik.errors.email
                                            ? 'email-error'
                                            : undefined
                                    }
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p id="email-error" className="error-message" role="alert">
                                        {formik.errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <div className="password-header">
                                    <label className="form-label" htmlFor="password">
                                        {t('auth.login.password')}
                                    </label>
                                    <Link to="/forgot-password" className="forgot-link">
                                        {t('auth.login.forgotPassword')}
                                    </Link>
                                </div>
                                <input
                                    className={`form-input ${
                                        formik.touched.password && formik.errors.password
                                            ? 'error'
                                            : ''
                                    }`}
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.login.passwordPlaceholder')}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-describedby={
                                        formik.touched.password && formik.errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                />
                                {formik.touched.password && formik.errors.password && (
                                    <p id="password-error" className="error-message" role="alert">
                                        {formik.errors.password}
                                    </p>
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
                                className={`btn-primary ${auth.isLoading ? 'loading' : ''}`}
                                disabled={auth.isLoading}
                                aria-label={
                                    auth.isLoading
                                        ? t('auth.login.submitting')
                                        : t('auth.login.submit')
                                }
                            >
                                {auth.isLoading ? (
                                    <>
                                        <svg
                                            className="spinner"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeOpacity="0.3"
                                            />
                                            <path
                                                d="M12 2a10 10 0 0 1 10 10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                        </svg>
                                        {t('auth.login.submitting')}
                                    </>
                                ) : (
                                    t('auth.login.submit')
                                )}
                            </button>

                            {/* Auth Error */}
                            {auth.error && (
                                <div className="auth-error" role="alert">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                    {auth.error}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="auth-divider">
                                <div className="divider-line"></div>
                                <span className="divider-text">{t('auth.login.socialLogin')}</span>
                                <div className="divider-line"></div>
                            </div>

                            {/* Social Login */}
                            <div className="social-buttons">
                                <a
                                    className="btn-social"
                                    href={GOOGLE_AUTH_LINK}
                                    aria-label={`Continue with ${t('auth.login.google')}`}
                                >
                                    <img
                                        alt={t('auth.login.google')}
                                        className="social-icon"
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTJ2NC4yNmg1LjkyYy0uMjYgMS4zNy0xLjA0IDIuNTMtMi4yMSAzLjMxdjIuNzdoMy41N2MyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOXoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTEyIDIzYzIuOTcgMCA1LjQ2LS45OCA3LjI4LTIuNjZsLTMuNTctMi43N2MtLjk4LjY2LTIuMjMgMS4wNi0zLjcxIDEuMDYtMi44NiAwLTUuMjktMS45My02LjE2LTQuNTNIMi4xOHYyLjg0QzMuOTkgMjAuNTMgNy43IDIzIDEyIDIzeiIgZmlsbD0iIzM0QTg1MyIvPgo8cGF0aCBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEyczQuNDMgMy40NSAxLjE4IDQuOTNsMi44NS0yLjIyLjgxLS42MnoiIGZpbGw9IiNGQkJDMDQiLz4KPHBhdGggZD0iTTEyIDUuMzhjMS42MiAwIDMuMDYuNTYgNC4yMSAxLjY0bDMuMTUtMy4xNUMxNy40NSAyLjA5IDE0Ljk3IDEgMTIgMSA3LjcgMSAzLjk5IDMuNDcgMi4xOCA3LjA3bDMuNjYgMi44NGMuODctMi42IDMuMy00LjUzIDYuMTYtNC41M3oiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+"
                                    />
                                    {t('auth.login.google')}
                                </a>
                                <a
                                    className="btn-social"
                                    href={FACEBOOK_AUTH_LINK}
                                    aria-label={`Continue with ${t('auth.login.facebook')}`}
                                >
                                    <img
                                        alt={t('auth.login.facebook')}
                                        className="social-icon"
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE4NzdGMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDEyLjA3M2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEyYzAgNS45OS00LjM4OCAxMC45NTQtMTAuMTI1IDExLjg1NHYtOC4zODVINy4wNzh2LTMuNDdoMy4wNDdWOS40M2MwLTMuMDA3IDEuNzkyLTQuNjY5IDQuNTMzLTQuNjY5IDEuMzEyIDAgMi42ODYuMjM1IDIuNjg2LjIzNXYyLjk1M0gxNS44M2MtMS40OTEgMC0xLjk1Ni45MjUtMS45NTYgMS44NzR2Mi4yNWgzLjMyOGwtLjUzMiAzLjQ3aC0yLjc5NnY4LjM4NUMxOS42MTIgMjMuMDI3IDI0IDE4LjA2MiAyNCAxMi4wNzN6Ii8+Cjwvc3ZnPg=="
                                    />
                                    {t('auth.login.facebook')}
                                </a>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="auth-footer">
                            {t('auth.login.noAccount')}{' '}
                            <Link to="/register" className="auth-link">
                                {t('auth.login.signUp')}
                            </Link>
                        </p>
                    </div>
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
