import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
    const { t } = useI18n();
    const location = useLocation();

    const menuItems = [
        {
            id: 'dashboard',
            label: t('admin.dashboard.title', 'Dashboard'),
            path: '/admin/dashboard',
            icon: '📊',
        },
        {
            id: 'products',
            label: t('admin.products.title', 'Products'),
            path: '/admin/products',
            icon: '🛍️',
        },
        {
            id: 'orders',
            label: t('admin.orders', 'Orders'),
            path: '/admin/orders',
            icon: '📦',
        },
        {
            id: 'users',
            label: t('admin.users', 'Users'),
            path: '/admin/users',
            icon: '👥',
        },
        {
            id: 'parentcategories',
            label: t('admin.parentCategories.title', 'Parent Categories'),
            path: '/admin/parentcategories',
            icon: '📁',
        },
        {
            id: 'categories',
            label: t('admin.categories.title', 'Categories'),
            path: '/admin/categories',
            icon: '📂',
        },
        {
            id: 'analytics',
            label: t('admin.analytics', 'Analytics'),
            path: '/admin/analytics',
            icon: '📈',
        },
        {
            id: 'settings',
            label: t('admin.settings', 'Settings'),
            path: '/admin/settings',
            icon: '⚙️',
        },
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    {!collapsed && (
                        <>
                            <span className="logo-icon">🐾</span>
                            <span className="logo-text">Petopia Admin</span>
                        </>
                    )}
                    {collapsed && <span className="logo-icon">🐾</span>}
                </div>
                <button
                    className="toggle-btn"
                    onClick={onToggle}
                    aria-label={
                        collapsed
                            ? t('admin.expandSidebar', 'Expand sidebar')
                            : t('admin.collapseSidebar', 'Collapse sidebar')
                    }
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <Link
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-text">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <Link
                    to="/"
                    className="back-to-store"
                    title={collapsed ? t('admin.backToStore', 'Back to Store') : ''}
                >
                    <span className="nav-icon">🏪</span>
                    {!collapsed && (
                        <span className="nav-text">{t('admin.backToStore', 'Back to Store')}</span>
                    )}
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
