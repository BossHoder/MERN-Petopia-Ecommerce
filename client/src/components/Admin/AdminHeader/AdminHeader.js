import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOutUser } from '../../../store/actions/authActions';
import { useI18n } from '../../../hooks/useI18n';
import { getAvatarUrl } from '../../../utils/helpers';
import './styles.css';

const AdminHeader = ({ onToggleSidebar, sidebarCollapsed }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { me } = useSelector((state) => state.auth);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logOutUser());
        navigate('/login');
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    return (
        <header className="admin-header">
            <div className="header-left">
                <button
                    className="mobile-menu-btn"
                    onClick={onToggleSidebar}
                    aria-label={t('admin.toggleSidebar', 'Toggle sidebar')}
                >
                    ☰
                </button>
                <h1 className="page-title">{t('admin.title', 'Admin Dashboard')}</h1>
            </div>

            <div className="header-right">
                {/* Notifications */}
                <button
                    className="notification-btn"
                    aria-label={t('admin.notifications', 'Notifications')}
                >
                    <span className="notification-icon">🔔</span>
                    <span className="notification-badge">3</span>
                </button>

                {/* User Menu */}
                <div className="user-menu" ref={userMenuRef}>
                    <button
                        className="user-menu-trigger"
                        onClick={toggleUserMenu}
                        aria-label={t('admin.userMenu', 'User menu')}
                    >
                        <img
                            src={getAvatarUrl(me?.avatar)}
                            alt={me?.name || 'User'}
                            className="user-avatar"
                        />
                        <span className="user-name">{me?.name}</span>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {userMenuOpen && (
                        <div className="user-dropdown">
                            <div className="user-info">
                                <div className="user-details">
                                    <div className="user-name-large">{me?.name}</div>
                                    <div className="user-email">{me?.email}</div>
                                    <div className="user-role">{me?.role}</div>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <span className="item-icon">👤</span>
                                {t('admin.profile', 'Profile')}
                            </button>

                            <button
                                className="dropdown-item"
                                onClick={() => navigate('/admin/settings')}
                            >
                                <span className="item-icon">⚙️</span>
                                {t('admin.settings', 'Settings')}
                            </button>

                            <div className="dropdown-divider"></div>

                            <button className="dropdown-item logout-item" onClick={handleLogout}>
                                <span className="item-icon">🚪</span>
                                {t('auth.logout', 'Logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
