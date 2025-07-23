import React from 'react';
import { useTranslation } from 'react-i18next';

import './styles.css';

const Loader = (props) => {
    const { t } = useTranslation('common');
    return (
        <div className="loader-container loader" {...props}>
            <h3 className="loader-content">{t('common.loading', 'Loading..')}</h3>
        </div>
    );
};

export default Loader;
