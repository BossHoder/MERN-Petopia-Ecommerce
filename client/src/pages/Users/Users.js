import React, { useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../layout/Layout';
import Loader from '../../components/Loader/Loader';
import requireAdmin from '../../hoc/requireAdmin';
import { getUsers } from '../../store/actions/usersActions';

import './styles.css';

const Users = ({ getUsers, users: { users, isLoading, error } }) => {
    useEffect(() => {
        getUsers();
    }, [getUsers]);

    if (isLoading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="users-page">
                <h1>Users Management</h1>
                <p>
                    <Link className="bold" to="/admin">
                        ← Back to Admin Dashboard
                    </Link>
                </p>

                {error && <div className="error-message">Error loading users: {error}</div>}

                {users && users.length > 0 ? (
                    <div className="users-list">
                        <h2>All Users ({users.length})</h2>
                        <div className="users-grid">
                            {users.map((user) => (
                                <div key={user._id} className="user-card">
                                    <div className="user-avatar">
                                        <img
                                            src={user.avatar || '/images/avatar0.jpg'}
                                            alt={user.name}
                                            onError={(e) => {
                                                e.target.src = '/images/avatar0.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="user-info">
                                        <h3>
                                            <Link to={`/${user.username}`}>{user.name}</Link>
                                        </h3>
                                        <p className="username">@{user.username}</p>
                                        <p className="email">{user.email}</p>
                                        <p className={`role ${user.role?.toLowerCase()}`}>
                                            {user.role || 'USER'}
                                        </p>
                                        {user.createdAt && (
                                            <p className="joined">
                                                Joined:{' '}
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="no-users">
                            <p>No users found.</p>
                        </div>
                    )
                )}
            </div>
        </Layout>
    );
};

const mapStateToProps = (state) => ({
    users: state.users,
});

export default compose(connect(mapStateToProps, { getUsers }), requireAdmin)(Users);
