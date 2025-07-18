import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../layout/Layout';
import MessageList from '../../components/MessageList/MessageList';
import MessageForm from '../../components/MessageForm/MessageForm';
import { reseedDatabase } from '../../store/actions/authActions';
import { useI18n } from '../../hooks/useI18n';

import './styles.css';

const Home = ({ auth, reseedDatabase }) => {
    const { t } = useI18n();

    return (
        <Layout>
            <div className="home-page">
                <h1>{t('navigation.home')}</h1>
                <h2>{t('app.title')}</h2>
                <p>{t('app.subtitle')}</p>

                {!auth.isAuthenticated ? (
                    <div>
                        <p>
                            {t('common.welcome')} guest!{' '}
                            <Link className="bold" to="/login">
                                {t('navigation.login')}
                            </Link>{' '}
                            or{' '}
                            <Link className="bold" to="/register">
                                {t('navigation.register')}
                            </Link>
                        </p>
                    </div>
                ) : (
                    <>
                        <p>
                            {t('common.welcome')} <span className="name">{auth.me.name}</span>!
                        </p>
                    </>
                )}
            </div>
        </Layout>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default compose(connect(mapStateToProps, { reseedDatabase }))(Home);
