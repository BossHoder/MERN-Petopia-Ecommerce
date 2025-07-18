import React from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';

import { useFormik } from 'formik';

import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { loginUserWithEmail } from '../../store/actions/authActions';
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from '../../constants';
import { loginSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Login = ({ auth, history, loginUserWithEmail }) => {
    const { t } = useI18n();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: (values) => {
            loginUserWithEmail(values, history);
        },
    });

    if (auth.isAuthenticated) return <Redirect to="/" />;

    return (
        <div className="login">
            <div className="container">
                <h1>{t('auth.login.title')}</h1>
                <p>
                    {t('common.backTo')}{' '}
                    <Link className="bold" to="/">
                        {t('navigation.home')}
                    </Link>
                </p>
                <form onSubmit={formik.handleSubmit} noValidate>
                    <h2>{t('auth.login.socialLogin')}</h2>
                    <a className="fb btn" href={FACEBOOK_AUTH_LINK}>
                        <span className="login-text">
                            <i className="fa fa-facebook fa-fw" /> {t('auth.login.facebook')}
                        </span>
                    </a>
                    <a className="google btn" href={GOOGLE_AUTH_LINK}>
                        <span className="login-text">
                            <i className="fa fa-google fa-fw" /> {t('auth.login.google')}
                        </span>
                    </a>
                    <div>
                        <input
                            placeholder={t('auth.login.email')}
                            name="email"
                            className="text"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <p className="error">{formik.errors.email}</p>
                        ) : null}
                        <input
                            placeholder={t('auth.login.password')}
                            name="password"
                            type="password"
                            className="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <p className="error">{formik.errors.password}</p>
                        ) : null}
                    </div>
                    {auth.error && <p className="error">{auth.error}</p>}
                    <div>
                        <button
                            className="btn submit"
                            disabled={auth.isLoading || !formik.isValid}
                            type="submit"
                        >
                            {t('auth.login.submit')}
                        </button>
                    </div>
                    <div>
                        {t('auth.login.noAccount')}{' '}
                        <Link className="bold" to="/register">
                            {t('navigation.register')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors,
});

export default compose(withRouter, connect(mapStateToProps, { loginUserWithEmail }))(Login);
