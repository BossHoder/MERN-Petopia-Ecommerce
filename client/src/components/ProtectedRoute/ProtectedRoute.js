import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../Loader/Loader';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
    const { isAuthenticated, me, appLoaded } = useSelector((state) => state.auth);
    const location = useLocation();

    // Debug logging
    console.log('🛡️ ProtectedRoute Debug:', {
        path: location.pathname,
        requireAuth,
        requireAdmin,
        isAuthenticated,
        userRole: me?.role,
        appLoaded,
        hasToken: !!localStorage.getItem('token'),
    });

    // Chờ app load xong trước khi quyết định redirect
    if (!appLoaded) {
        return <Loader />;
    }

    // Nếu route yêu cầu authentication nhưng user chưa đăng nhập
    if (requireAuth && !isAuthenticated) {
        // Lưu current path để redirect về sau khi login
        const redirectPath = location.pathname !== '/login' ? location.pathname : '/';
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
    }

    // Nếu route yêu cầu admin role nhưng user không phải admin
    if (requireAdmin && (!isAuthenticated || me?.role !== 'ADMIN')) {
        return <Navigate to="/" replace />;
    }

    // Nếu user đã đăng nhập và cố truy cập login/register page
    if (
        !requireAuth &&
        isAuthenticated &&
        (location.pathname === '/login' || location.pathname === '/register')
    ) {
        // Get redirect parameter from URL
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect') || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
