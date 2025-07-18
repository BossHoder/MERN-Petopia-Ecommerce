import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { logOutUser } from '../../store/actions/authActions';
import { getAvatarUrl } from '../../utils/helpers';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Navbar = ({ auth, logOutUser, history }) => {
    const { t } = useI18n();

    const onLogOut = (event) => {
        event.preventDefault();
        logOutUser(history);
    };

    return (
        <nav className="navbar">
            <h2 className="logo">PETOPIA</h2>
            <ul className="nav-links flex-1">
                <li className="nav-item">
                    <Link to="/">{t('navigation.home')}</Link>
                </li>
                {auth.isAuthenticated ? (
                    <>
                        <li className="nav-item">
                            <Link to={`/${auth.me.username}`}>{t('navigation.account')}</Link>
                        </li>
                        {auth.me?.role === 'ADMIN' && (
                            <li className="nav-item">
                                <Link to="/admin">Admin</Link>
                            </li>
                        )}
                        <li className="flex-1" />
                        <img className="avatar" src={getAvatarUrl(auth.me.avatar)} />
                        <li className="nav-item" onClick={onLogOut}>
                            <a href="#">{t('navigation.logout')}</a>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="flex-1" />

                        <li className="nav-item">
                            <Link to="/login">{t('navigation.login')}</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default compose(withRouter, connect(mapStateToProps, { logOutUser }))(Navbar);
