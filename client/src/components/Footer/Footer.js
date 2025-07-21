import React from 'react';
import { useTranslation } from 'react-i18next';

import './styles.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <div className="footer">
            <div className="footer-content">
                <span className="username">{t('footer.copyright')}</span>
                <span className="description">{t('footer.description')}</span>
                <iframe
                    src="https://ghbtns.com/github-btn.html?user=BossHoder&repo=MERN-Petopia-Ecommerce&type=star&count=true&size=large"
                    frameBorder="0"
                    scrolling="0"
                    width="160px"
                    height="30px"
                ></iframe>
            </div>
        </div>
    );
};

export default Footer;
