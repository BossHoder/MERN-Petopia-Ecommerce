import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslations from './locales/en/common.json';
import viTranslations from './locales/vi/common.json';

const resources = {
    en: {
        common: enTranslations,
    },
    vi: {
        common: viTranslations,
    },
};

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,

        // Language to use if no translation is found
        fallbackLng: 'en',

        // Default namespace
        defaultNS: 'common',

        // Debug mode for development
        debug: process.env.NODE_ENV === 'development',

        // Options for language detection
        detection: {
            // Where to store language preference
            order: ['localStorage', 'navigator', 'htmlTag'],
            // Keys to look for language
            lookupLocalStorage: 'i18nextLng',
            // Cache user language
            caches: ['localStorage'],
        },

        interpolation: {
            // Not needed for React as it escapes by default
            escapeValue: false,
        },
    });

export default i18n;
