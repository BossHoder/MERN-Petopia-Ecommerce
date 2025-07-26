import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';

// Import i18n configuration
import './i18n/i18n';

import Layout from './layout/Layout'; // Import Layout
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Users from './pages/Users/Users';
import Admin from './pages/Admin/Admin';
import NotFound from './pages/NotFound/NotFound';
import Cart from './pages/Cart/Cart'; // Import Cart
import Checkout from './pages/Checkout/Checkout'; // Import Checkout
import OrderDetails from './pages/OrderDetails/OrderDetails'; // Import OrderDetails
import Products from './pages/Products/Products'; // Import Products
import ProductDetails from './pages/ProductDetails/ProductDetails'; // Import ProductDetails
import CategoryPage from './pages/Category/CategoryPage'; // Import CategoryPage
import SubcategoryPage from './pages/Category/SubcategoryPage'; // Import SubcategoryPage

import Loader from './components/Loader/Loader';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { logInUserWithOauth, loadMe } from './store/actions/authActions';

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
    const { appLoaded } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(loadMe());
    }, [dispatch]);

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
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                        <Route
                            path="/category/:parentSlug/:categorySlug"
                            element={<SubcategoryPage />}
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                                    <Users />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/notfound" element={<NotFound />} />
                        <Route
                            path="/admin"
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
            ) : (
                <Loader />
            )}
        </>
    );
};

export default App;
