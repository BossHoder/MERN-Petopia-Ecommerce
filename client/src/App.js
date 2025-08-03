import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';

// Import i18n configuration
import './i18n/i18n';

// Import toast styles
import './styles/toastStyles.css';

import Layout from './layout/Layout'; // Import Layout
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import AdminUsers from './pages/Admin/Users/Users';
import Admin from './pages/Admin/Admin';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout'; // Import AdminLayout
import Dashboard from './pages/Admin/Dashboard/Dashboard'; // Import Dashboard
import ParentCategories from './pages/Admin/ParentCategories/ParentCategories'; // Import ParentCategories
import Categories from './pages/Admin/Categories/Categories'; // Import Categories
import AdminProducts from './pages/Admin/Products/Products'; // Import Admin Products
import AdminOrders from './pages/Admin/Orders/Orders'; // Import Admin Orders
import AdminCoupons from './pages/Admin/Coupons/Coupons'; // Import Admin Coupons
import AdminNotifications from './pages/Admin/Notifications/Notifications'; // Import Admin Notifications
import Analytics from './pages/Admin/Analytics/AnalyticsEnhanced'; // Import Enhanced Analytics
import NotFound from './pages/NotFound/NotFound';
import Cart from './pages/Cart/Cart'; // Import Cart
import Checkout from './pages/Checkout/Checkout'; // Import Checkout
import OrderDetails from './pages/OrderDetails/OrderDetails'; // Import OrderDetails
import Products from './pages/Products/Products'; // Import Products
import ProductDetail from './pages/ProductDetail/ProductDetail'; // Import ProductDetail
import CategoryPage from './pages/Category/CategoryPage'; // Import CategoryPage
import SubcategoryPage from './pages/Category/SubcategoryPage'; // Import SubcategoryPage
import Coupons from './pages/Coupons/Coupons'; // Import Coupons
import NotificationsPage from './pages/NotificationsPage'; // Import Notifications

import Loader from './components/Loader/Loader';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authDebugger from './utils/authDebugger'; // Import auth debugger

import { logInUserWithOauth, loadMe } from './store/actions/authActions';
import socketService from './services/socketService';

function ToastDispatcher() {
    const queue = useSelector((state) => state.toast.queue);
    const dispatch = useDispatch();
    useEffect(() => {
        if (queue.length > 0) {
            const { message, type } = queue[0];
            toast[type || 'info'](message);
            setTimeout(() => {
                dispatch({ type: 'REMOVE_TOAST' });
            }, 100);
        }
    }, [queue, dispatch]);
    return null;
}

const App = () => {
    const dispatch = useDispatch();
    const { appLoaded, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(loadMe());

        // Make auth debugger available globally for debugging
        if (process.env.NODE_ENV === 'development') {
            window.authDebugger = authDebugger;
            console.log('🔧 Auth Debugger available: window.authDebugger');
        }
    }, [dispatch]);

    // Socket.io connection management
    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect to socket when user is authenticated
            socketService.connect();

            // Request notification permission
            socketService.requestNotificationPermission();

            // Update user presence
            socketService.updateUserPresence(true);
        } else {
            // Disconnect socket when user logs out
            socketService.disconnect();
        }

        // Cleanup on component unmount
        return () => {
            socketService.updateUserPresence(false);
            socketService.disconnect();
        };
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (window.location.hash === '#_=_') window.location.hash = '';

        const cookieJwt = Cookies.get('x-auth-cookie');
        if (cookieJwt) {
            Cookies.remove('x-auth-cookie');
            dispatch(logInUserWithOauth(cookieJwt));
        }
    }, [dispatch]);

    return (
        <>
            <ToastDispatcher />
            {appLoaded ? (
                <Routes>
                    {/* Admin Routes - Separate from main layout */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="parentcategories" element={<ParentCategories />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<div>Admin Settings - Coming Soon</div>} />
                    </Route>

                    {/* Customer-facing Routes - Wrapped in main Layout */}
                    <Route
                        path="/*"
                        element={
                            <Layout>
                                <Routes>
                                    <Route
                                        path="/login"
                                        element={
                                            <ProtectedRoute requireAuth={false}>
                                                <Login />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/register"
                                        element={
                                            <ProtectedRoute requireAuth={false}>
                                                <Register />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/product/:slug" element={<ProductDetail />} />
                                    <Route path="/category/:slug" element={<CategoryPage />} />
                                    <Route
                                        path="/category/:parentSlug/:categorySlug"
                                        element={<SubcategoryPage />}
                                    />
                                    <Route path="/coupons" element={<Coupons />} />
                                    <Route
                                        path="/notifications"
                                        element={
                                            <ProtectedRoute requireAuth={true}>
                                                <NotificationsPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route path="/notfound" element={<NotFound />} />

                                    {/* Legacy admin route for backward compatibility */}
                                    <Route
                                        path="/admin-legacy"
                                        element={
                                            <ProtectedRoute requireAuth={true} requireAdmin={true}>
                                                <Admin />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route
                                        path="/order/:id"
                                        element={
                                            <ProtectedRoute requireAuth={true}>
                                                <OrderDetails />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute requireAuth={true}>
                                                <Profile />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/:username"
                                        element={
                                            <ProtectedRoute requireAuth={true}>
                                                <Profile />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/" element={<Home />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                                <ToastContainer
                                    position="top-right"
                                    autoClose={3000}
                                    hideProgressBar={false}
                                    newestOnTop={false}
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                    theme="colored"
                                />
                            </Layout>
                        }
                    />
                </Routes>
            ) : (
                <Loader />
            )}
        </>
    );
};

export default App;
