import React from 'react';
import { Link } from 'react-router-dom';

import Layout from '../../layout/Layout';
import './styles.css';
import { useI18n } from '../../hooks/useI18n';

const NotFound = () => {
    const { t } = useI18n();

    return (
        <Layout>
            <div className="not-found-page">
                <h1>{t('common.notFound')}</h1>
                <p>
                    {t('common.goBackTo')}{' '}
                    <Link className="bold" to="/">
                        {t('navigation.home')}
                    </Link>
                </p>
            </div>
        </Layout>
    );
};

export default NotFound;
