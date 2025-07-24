import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';

import { connect } from 'react-redux';

import { useFormik } from 'formik';

import { registerUserWithEmail } from '../../store/actions/registerActions';
import { getRegisterSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Register = ({ auth, register, registerUserWithEmail }) => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: getRegisterSchema(t),
        onSubmit: (values) => {
            registerUserWithEmail(values, navigate);
        },
    });

    if (auth.isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="petopia-register-page">
            {/* Hero Section - Left Side */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">Join the Petopia Family!</h1>
                        <p className="hero-subtitle">
                            Create your account and discover everything your pet needs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section - Right Side */}
            <div className="form-section">
                <div className="form-container">
                    <div className="register-card">
                        <h2 className="register-title">Create your account</h2>
                        <form onSubmit={formik.handleSubmit} noValidate className="petopia-form">
                            {/* Full Name Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    className={`form-input ${
                                        formik.touched.name && formik.errors.name ? 'error' : ''
                                    }`}
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Full Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-describedby={
                                        formik.touched.name && formik.errors.name
                                            ? 'name-error'
                                            : undefined
                                    }
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p id="name-error" className="error-message" role="alert">
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Username Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className={`form-input ${
                                        formik.touched.username && formik.errors.username
                                            ? 'error'
                                            : ''
                                    }`}
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-describedby={
                                        formik.touched.username && formik.errors.username
                                            ? 'username-error'
                                            : undefined
                                    }
                                />
                                {formik.touched.username && formik.errors.username && (
                                    <p id="username-error" className="error-message" role="alert">
                                        {formik.errors.username}
                                    </p>
                                )}
                            </div>

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
                                <label className="form-label" htmlFor="password">
                                    Password
                                </label>
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

                            {/* Confirm Password Field */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    className={`form-input ${
                                        formik.touched.confirmPassword &&
                                        formik.errors.confirmPassword
                                            ? 'error'
                                            : ''
                                    }`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    aria-describedby={
                                        formik.touched.confirmPassword &&
                                        formik.errors.confirmPassword
                                            ? 'confirmPassword-error'
                                            : undefined
                                    }
                                />
                                {formik.touched.confirmPassword &&
                                    formik.errors.confirmPassword && (
                                        <p
                                            id="confirmPassword-error"
                                            className="error-message"
                                            role="alert"
                                        >
                                            {formik.errors.confirmPassword}
                                        </p>
                                    )}
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`btn-primary ${auth.isLoading ? 'loading' : ''}`}
                                disabled={auth.isLoading}
                                aria-label={auth.isLoading ? 'Creating account...' : 'Register'}
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
                                        Creating account...
                                    </>
                                ) : (
                                    'Register'
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
                        </form>

                        {/* Footer */}
                        <p className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
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
    register: state.register,
});

export default connect(mapStateToProps, { registerUserWithEmail })(Register);
