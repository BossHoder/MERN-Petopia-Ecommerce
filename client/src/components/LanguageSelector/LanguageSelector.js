import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-selector">
            <button
                className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                title="English"
            >
                🇺🇸 EN
            </button>
            <button
                className={`language-btn ${i18n.language === 'vi' ? 'active' : ''}`}
                onClick={() => changeLanguage('vi')}
                title="Tiếng Việt"
            >
                🇻🇳 VI
            </button>
        </div>
    );
};

export default LanguageSelector;
