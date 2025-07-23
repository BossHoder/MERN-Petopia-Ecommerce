import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { logOutUser } from '../../store/actions/authActions';
import { getAvatarUrl } from '../../utils/helpers';
import { useI18n } from '../../hooks/useI18n';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import SearchBox from '../SearchBox/SearchBox'; // Import SearchBox
import './styles.css';

const Navbar = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { isAuthenticated, me } = useSelector((state) => state.auth);
    const { items: cartItems } = useSelector((state) => state.cart);

    const onLogOut = (event) => {
        event.preventDefault();
        dispatch(logOutUser(navigate));
    };

    const navigationItems = [
        { key: 'shop', path: '/products', label: 'Cửa hàng' }, // Changed to /products
        { key: 'dogs', path: '/products?category=dogs', label: 'Dành cho Chó' },
        { key: 'cats', path: '/products?category=cats', label: 'Dành cho Mèo' },
        { key: 'about', path: '/about', label: 'Về chúng tôi' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <h1 className="logo-text">PETOPIA</h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-nav desktop-nav">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`nav-link ${
                                    isActive(item.path) ? 'nav-link-active' : ''
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="navbar-actions">
                        {/* Search Box */}
                        <SearchBox />

                        {/* Language Selector */}
                        <LanguageSelector />

                        {isAuthenticated ? (
                            <>
                                {/* User Menu */}
                                <div className="user-menu">
                                    <Link to={`/${me.username}`} className="nav-icon-btn">
                                        <img
                                            className="avatar"
                                            src={getAvatarUrl(me.avatar)}
                                            alt="Avatar"
                                        />
                                    </Link>
                                    {me?.role === 'ADMIN' && (
                                        <Link to="/admin" className="nav-link admin-link">
                                            Admin
                                        </Link>
                                    )}
                                    <button onClick={onLogOut} className="nav-link logout-btn">
                                        {t('navigation.logout')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link login-btn">
                                Đăng nhập
                            </Link>
                        )}

                        {/* Shopping Cart */}
                        <Link to="/cart" className="nav-icon-btn cart-btn">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                            </svg>
                            {cartItems.length > 0 && (
                                <span className="cart-count">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="mobile-nav">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`mobile-nav-link ${
                                    isActive(item.path) ? 'mobile-nav-link-active' : ''
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
