import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logOutUser } from '../../store/actions/authActions';
import { useI18n } from '../../hooks/useI18n';
import LanguageSelector from '../LanguageSelector';
import SearchBox from '../SearchBox/SearchBox';
import './styles.css';

const AppNavbar = () => {
    const { t } = useI18n('common');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { cartItems = [] } = useSelector((state) => state.cart);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logOutUser(navigate));
        setDropdownOpen(false);
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const authLinks = (
        <>
            {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                    {t('navigation.admin')}
                </Link>
            )}
            <Link to="/cart" className="nav-link cart-icon">
                <i className="fas fa-shopping-cart"></i>
                {cartItems.length > 0 && (
                    <span className="badge">
                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                )}
            </Link>
            <div className="avatar-container" ref={dropdownRef}>
                <img
                    src={user?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'}
                    alt="User Avatar"
                    className="avatar"
                    onClick={toggleDropdown}
                />
                {dropdownOpen && (
                    <div className="avatar-dropdown-menu">
                        <Link
                            to="/profile"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                        >
                            {t('navigation.profile')}
                        </Link>
                        <Link
                            to="/coupons"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                        >
                            {t('navigation.coupons')}
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item">
                            <i className="fas fa-sign-out-alt me-2"></i>
                            {t('navigation.logout')}
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    const guestLinks = (
        <>
            <Link to="/login" className="nav-link">
                {t('navigation.login')}
            </Link>
            <Link to="/register" className="nav-link">
                {t('navigation.register')}
            </Link>
        </>
    );

    return (
        <nav className="navbar-main">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        <img src="/logo192.png" alt="Petopia" height="30" />
                        <span>Petopia</span>
                    </Link>
                    <div className="navbar-links">
                        <Link to="/" className="nav-link">
                            {t('navigation.home')}
                        </Link>
                        <Link to="/products" className="nav-link">
                            {t('navigation.products')}
                        </Link>
                    </div>
                </div>
                <div className="navbar-right">
                    <div className="navbar-search">
                        <SearchBox />
                    </div>
                    <LanguageSelector />
                    {isAuthenticated ? authLinks : guestLinks}
                </div>
            </div>
        </nav>
    );
};

export default AppNavbar;
