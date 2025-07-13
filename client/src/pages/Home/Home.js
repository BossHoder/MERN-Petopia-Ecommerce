import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../layout/Layout';
import MessageList from '../../components/MessageList/MessageList';
import MessageForm from '../../components/MessageForm/MessageForm';
import { reseedDatabase } from '../../store/actions/authActions';

import './styles.css';

const Home = ({ auth, reseedDatabase }) => {
    return (
        <Layout>
            <div className="home-page">
                <h1>Home page</h1>
                {!auth.isAuthenticated ? (
                    <div>
                        <p>
                            Welcome guest!{' '}
                            <Link className="bold" to="/login">
                                Log in
                            </Link>{' '}
                            or{' '}
                            <Link className="bold" to="/register">
                                Register
                            </Link>
                        </p>
                    </div>
                ) : (
                    <>
                        <p>
                            Welcome <span className="name">{auth.me.name}</span>!
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
