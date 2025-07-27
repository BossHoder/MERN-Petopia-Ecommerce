import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <AdminHeader onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
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
        </div>
    );
};

export default AdminLayout;
