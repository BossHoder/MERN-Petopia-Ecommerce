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
                        Về Trang chủ
                    </Link>
                </div>

                <div className="auth-card">
                    {/* Header */}
                    <div className="auth-header">
                        <h1 className="auth-title">Đăng nhập</h1>
                        <p className="auth-subtitle">
                            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} noValidate className="auth-form">
                        {/* Social Login */}
                        <div className="social-login">
                            <p className="social-title">Đăng nhập nhanh với</p>
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
                                    Facebook
                                </a>
                                <a className="social-btn google-btn" href={GOOGLE_AUTH_LINK}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </a>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="auth-divider">
                            <span>hoặc</span>
                        </div>

                        {/* Form Fields */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`form-input ${
                                    formik.touched.email && formik.errors.email ? 'error' : ''
                                }`}
                                placeholder="Nhập địa chỉ email của bạn"
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
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={`form-input ${
                                    formik.touched.password && formik.errors.password ? 'error' : ''
                                }`}
                                placeholder="Nhập mật khẩu của bạn"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-message">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Auth Error */}
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
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>

                        {/* Footer */}
                        <div className="auth-footer">
                            <p>
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="auth-link">
                                    Đăng ký ngay
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
