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
                <p>
                    {t('admin.description')}{' '}
                    <Link className="bold" to="/">
                        {t('navigation.home')}
                    </Link>
                </p>
            </div>
        </Layout>
    );
};

export default requireAdmin(Admin);
