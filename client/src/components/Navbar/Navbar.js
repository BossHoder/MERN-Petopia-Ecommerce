import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { logout } from '../../store/actions/authActions';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import SearchBox from '../SearchBox';
import './styles.css';

const AppNavbar = () => {
    const { t } = useTranslation('common');
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);

    const handleLogout = () => {
        dispatch(logout());
    };

    const authLinks = (
        <>
            {user && user.role === 'admin' && (
                <LinkContainer to="/admin">
                    <Nav.Link>{t('navbar.admin')}</Nav.Link>
                </LinkContainer>
            )}
            <LinkContainer to="/cart">
                <Nav.Link>
                    <i className="fas fa-shopping-cart"></i>
                    {cartItems.length > 0 && (
                        <span className="badge badge-pill badge-danger">
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </Nav.Link>
            </LinkContainer>

            <NavDropdown
                title={
                    <img
                        src={user?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'}
                        alt="User Avatar"
                        className="avatar"
                    />
                }
                id="user-menu-dropdown"
                align="end"
                className="avatar-dropdown"
            >
                <LinkContainer to="/profile">
                    <NavDropdown.Item>{t('navbar.profile')}</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/coupons">
                    <NavDropdown.Item>{t('navbar.coupons')}</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    {t('navbar.logout')}
                </NavDropdown.Item>
            </NavDropdown>
        </>
    );

    const guestLinks = (
        <>
            <LinkContainer to="/login">
                <Nav.Link>{t('navbar.login')}</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/register">
                <Nav.Link>{t('navbar.register')}</Nav.Link>
            </LinkContainer>
        </>
    );

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <img
                            src="/logo.png"
                            alt="Petopia"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        Petopia
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <SearchBox />
                    </Nav>
                    <Nav className="align-items-center">
                        <LinkContainer to="/">
                            <Nav.Link>{t('navbar.home')}</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/products">
                            <Nav.Link>{t('navbar.products')}</Nav.Link>
                        </LinkContainer>
                        {isAuthenticated ? authLinks : guestLinks}
                        <LanguageSelector />
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;
