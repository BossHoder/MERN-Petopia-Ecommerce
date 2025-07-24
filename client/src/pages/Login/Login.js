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
        <div className="petopia-login-page">
            {/* Hero Section - Left Side */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">Welcome to Petopia</h1>
                        <p className="hero-subtitle">
                            Your one-stop shop for everything your pet needs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side */}
            <div className="form-section">
                <div className="form-container">
                    {/* Logo and Header */}
                    <div className="login-header">
                        <Link to="/" className="petopia-logo">
                            <svg
                                className="logo-icon"
                                fill="none"
                                viewBox="0 0 48 48"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
                                    fill="currentColor"
                                ></path>
                                <path
                                    clipRule="evenodd"
                                    d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                ></path>
                            </svg>
                            <h1 className="logo-text">Petopia</h1>
                        </Link>
                    </div>

                    <div className="login-card">
                        <h2 className="login-title">Welcome Back!</h2>
                        <p className="login-subtitle">Log in to continue to your account.</p>

                        <form onSubmit={formik.handleSubmit} noValidate className="petopia-form">
                            {/* Email Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    className={`form-input ${
                                        formik.touched.email && formik.errors.email ? 'error' : ''
                                    }`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
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
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="forgot-link">
                                        Forgot Password?
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
                                    placeholder="••••••••"
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
                                aria-label={auth.isLoading ? 'Logging in...' : 'Log In'}
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
                                        Logging in...
                                    </>
                                ) : (
                                    'Log In'
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
                                <span className="divider-text">Or continue with</span>
                                <div className="divider-line"></div>
                            </div>

                            {/* Social Login */}
                            <div className="social-buttons">
                                <a
                                    className="btn-social"
                                    href={GOOGLE_AUTH_LINK}
                                    aria-label="Continue with Google"
                                >
                                    <img
                                        alt="Google"
                                        className="social-icon"
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTJ2NC4yNmg1LjkyYy0uMjYgMS4zNy0xLjA0IDIuNTMtMi4yMSAzLjMxdjIuNzdoMy41N2MyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOXoiIGZpbGw9IiM0Mjg1RjQiLz4KPHBhdGggZD0iTTEyIDIzYzIuOTcgMCA1LjQ2LS45OCA3LjI4LTIuNjZsLTMuNTctMi43N2MtLjk4LjY2LTIuMjMgMS4wNi0zLjcxIDEuMDYtMi44NiAwLTUuMjktMS45My02LjE2LTQuNTNIMi4xOHYyLjg0QzMuOTkgMjAuNTMgNy43IDIzIDEyIDIzeiIgZmlsbD0iIzM0QTg1MyIvPgo8cGF0aCBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEyczQuNDMgMy40NSAxLjE4IDQuOTNsMi44NS0yLjIyLjgxLS42MnoiIGZpbGw9IiNGQkJDMDQiLz4KPHBhdGggZD0iTTEyIDUuMzhjMS42MiAwIDMuMDYuNTYgNC4yMSAxLjY0bDMuMTUtMy4xNUMxNy40NSAyLjA5IDE0Ljk3IDEgMTIgMSA3LjcgMSAzLjk5IDMuNDcgMi4xOCA3LjA3bDMuNjYgMi44NGMuODctMi42IDMuMy00LjUzIDYuMTYtNC41M3oiIGZpbGw9IiNFQTQzMzUiLz4KPC9zdmc+"
                                    />
                                    Google
                                </a>
                                <a
                                    className="btn-social"
                                    href={FACEBOOK_AUTH_LINK}
                                    aria-label="Continue with Facebook"
                                >
                                    <img
                                        alt="Facebook"
                                        className="social-icon"
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE4NzdGMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDEyLjA3M2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEyYzAgNS45OS00LjM4OCAxMC45NTQtMTAuMTI1IDExLjg1NHYtOC4zODVINy4wNzh2LTMuNDdoMy4wNDdWOS40M2MwLTMuMDA3IDEuNzkyLTQuNjY5IDQuNTMzLTQuNjY5IDEuMzEyIDAgMi42ODYuMjM1IDIuNjg2LjIzNXYyLjk1M0gxNS44M2MtMS40OTEgMC0xLjk1Ni45MjUtMS45NTYgMS44NzR2Mi4yNWgzLjMyOGwtLjUzMiAzLjQ3aC0yLjc5NnY4LjM4NUMxOS42MTIgMjMuMDI3IDI0IDE4LjA2MiAyNCAxMi4wNzN6Ii8+Cjwvc3ZnPg=="
                                    />
                                    Facebook
                                </a>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Sign up
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
