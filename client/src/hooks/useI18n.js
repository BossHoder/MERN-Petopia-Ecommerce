import { useTranslation } from 'react-i18next';

/**
 * Custom hook để sử dụng i18n dễ dàng hơn
 * Trả về function translate và các utilities thông dụng
 * @param {string | string[]} ns - Namespace để load
 */
export const useI18n = (ns = 'common') => {
    return useTranslation(ns);
};

export default useI18n;
