import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';

// Import i18n configuration
import './i18n/i18n';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Users from './pages/Users/Users';
import Admin from './pages/Admin/Admin';
import NotFound from './pages/NotFound/NotFound';

import Loader from './components/Loader/Loader';

import { logInUserWithOauth, loadMe } from './store/actions/authActions';

const App = ({ logInUserWithOauth, auth, loadMe }) => {
    useEffect(() => {
        // Gọi loadMe để kiểm tra authentication khi app khởi động
        loadMe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    //redosled hookova
    useEffect(() => {
        if (window.location.hash === '#_=_') window.location.hash = '';

        const cookieJwt = Cookies.get('x-auth-cookie');
        if (cookieJwt) {
            Cookies.remove('x-auth-cookie');
            logInUserWithOauth(cookieJwt);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Removed problematic useEffect that was causing infinite loops

    return (
        <>
            {auth.appLoaded ? (
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/users" component={Users} />
                    <Route path="/notfound" component={NotFound} />
                    <Route path="/admin" component={Admin} />
                    <Route exact path="/:username" component={Profile} />
                    <Route exact path="/" component={Home} />
                    <Route component={NotFound} />
                </Switch>
            ) : (
                <Loader />
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default compose(connect(mapStateToProps, { logInUserWithOauth, loadMe }))(App);
