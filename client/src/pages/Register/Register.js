import React from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';

import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { useFormik } from 'formik';

import { registerUserWithEmail } from '../../store/actions/registerActions';
import { registerSchema } from './validation';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Register = ({ auth, register: { isLoading, error }, history, registerUserWithEmail }) => {
    const { t } = useI18n();

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            email: '',
            password: '',
        },
        validationSchema: registerSchema,
        onSubmit: (values) => {
            registerUserWithEmail(values, history);
        },
    });

    if (auth.isAuthenticated) return <Redirect to="/" />;

    return (
        <div className="register">
            <div className="container">
                <h1>{t('auth.register.title')}</h1>
                <p>
                    {t('common.backTo')}{' '}
                    <Link className="bold" to="/">
                        {t('navigation.home')}
                    </Link>
                </p>
                <form onSubmit={formik.handleSubmit} noValidate>
                    <h2>{t('auth.register.subtitle')}</h2>
                    <div>
                        <input
                            placeholder={t('auth.register.name')}
                            name="name"
                            className=""
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <p className="error">{formik.errors.name}</p>
                        ) : null}
                        <input
                            placeholder={t('auth.register.username')}
                            name="username"
                            className=""
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.username}
                        />
                        {formik.touched.username && formik.errors.username ? (
                            <p className="error">{formik.errors.username}</p>
                        ) : null}
                        <input
                            placeholder={t('auth.register.email')}
                            name="email"
                            className=""
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <p className="error">{formik.errors.email}</p>
                        ) : null}
                        <input
                            placeholder={t('auth.register.password')}
                            name="password"
                            className=""
                            type="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <p className="error">{formik.errors.password}</p>
                        ) : null}
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div>
                        <button
                            className="btn submit"
                            type="submit"
                            disabled={isLoading || !formik.isValid}
                        >
                            {t('auth.register.submit')}
                        </button>
                    </div>
                    <div>
                        {t('auth.register.hasAccount')}{' '}
                        <Link className="bold" to="/login">
                            {t('navigation.login')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
    register: state.register,
});

export default compose(withRouter, connect(mapStateToProps, { registerUserWithEmail }))(Register);
