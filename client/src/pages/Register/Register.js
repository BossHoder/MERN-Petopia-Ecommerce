import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';

import { connect } from 'react-redux';

import { useFormik } from 'formik';

import { registerUserWithEmail } from '../../store/actions/registerActions';
import { registerSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Register = ({ auth, register: { isLoading, error }, registerUserWithEmail }) => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            email: '',
            password: '',
        },
        validationSchema: registerSchema,
        onSubmit: (values) => {
            registerUserWithEmail(values, navigate);
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
                        <h1 className="auth-title">Đăng ký</h1>
                    </div>

                    <form onSubmit={formik.handleSubmit} noValidate className="auth-form">
                        {/* Form Fields */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Họ và tên
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`form-input ${
                                    formik.touched.name && formik.errors.name ? 'error' : ''
                                }`}
                                placeholder="Nhập họ và tên của bạn"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="error-message">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className={`form-input ${
                                    formik.touched.username && formik.errors.username ? 'error' : ''
                                }`}
                                placeholder="Chọn tên đăng nhập duy nhất"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.username}
                            />
                            {formik.touched.username && formik.errors.username && (
                                <p className="error-message">{formik.errors.username}</p>
                            )}
                        </div>

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
                                placeholder="Tạo mật khẩu mạnh"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-message">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Register Error */}
                        {error && (
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
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading || !formik.isValid}
                        >
                            {isLoading ? (
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
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                'Tạo tài khoản'
                            )}
                        </button>

                        {/* Footer */}
                        <div className="auth-footer">
                            <p>
                                Đã có tài khoản?{' '}
                                <Link to="/login" className="auth-link">
                                    Đăng nhập ngay
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
    register: state.register,
});

export default connect(mapStateToProps, { registerUserWithEmail })(Register);
