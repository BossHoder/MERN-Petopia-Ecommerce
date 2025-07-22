import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';

import { useFormik } from 'formik';

import { registerUserWithEmail } from '../../store/actions/registerActions';
import { getRegisterSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';

const Register = ({ auth, register, registerUserWithEmail }) => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const [error, setError] = React.useState(null);
    const isLoading = auth?.isLoading || false;

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            email: '',
            password: '',
        },
        validationSchema: getRegisterSchema(t),
        onSubmit: async (values) => {
            setError(null);
            try {
                await registerUserWithEmail(values);
                navigate('/'); // or wherever you want to redirect
            } catch (err) {
                setError(err.message || t('auth.register.error'));
            }
        },
    });

    return (
        <div className="auth-page">
            <div className="auth-container">
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
                    <div className="auth-header">
                        <h1 className="auth-title">{t('auth.register.title')}</h1>
                    </div>
                    <form onSubmit={formik.handleSubmit} noValidate className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                {t('auth.register.name')}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`form-input ${
                                    formik.touched.name && formik.errors.name ? 'error' : ''
                                }`}
                                placeholder={t('auth.register.namePlaceholder')}
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
                                {t('auth.register.username')}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className={`form-input ${
                                    formik.touched.username && formik.errors.username ? 'error' : ''
                                }`}
                                placeholder={t('auth.register.usernamePlaceholder')}
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
                                {t('auth.register.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`form-input ${
                                    formik.touched.email && formik.errors.email ? 'error' : ''
                                }`}
                                placeholder={t('auth.register.emailPlaceholder')}
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
                                {t('auth.register.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={`form-input ${
                                    formik.touched.password && formik.errors.password ? 'error' : ''
                                }`}
                                placeholder={t('auth.register.passwordPlaceholder')}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="error-message">{formik.errors.password}</p>
                            )}
                        </div>
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
                                    {t('auth.register.submitting', 'Đang tạo tài khoản...')}
                                </>
                            ) : (
                                t('auth.register.submit')
                            )}
                        </button>
                        <div className="auth-footer">
                            <p>
                                {t('auth.register.hasAccount')}{' '}
                                <Link to="/login" className="auth-link">
                                    {t('auth.login.title')}
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
