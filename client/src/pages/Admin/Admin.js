import React from 'react';
import { Link } from 'react-router-dom';

import requireAdmin from '../../hoc/requireAdmin';
import Layout from '../../layout/Layout';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const Admin = () => {
    const { t } = useI18n();
    return (
        <Layout>
            <div className="admin-page">
                <h1>{t('admin.title')}</h1>
                <ul className="admin-menu">
                    <li>
                        <Link to="/users">{t('admin.manageUsers', 'Manage Users')}</Link>
                    </li>
                    <li>
                        <Link to="/products">{t('admin.manageProducts', 'Manage Products')}</Link>
                    </li>
                    <li>
                        <Link to="/categories">
                            {t('admin.manageCategories', 'Manage Categories')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/orders">{t('admin.manageOrders', 'Manage Orders')}</Link>
                    </li>
                    <li>
                        <Link to="/coupons">{t('admin.manageCoupons', 'Manage Coupons')}</Link>
                    </li>
                </ul>
            </div>
        </Layout>
    );
};

export default requireAdmin(Admin);
