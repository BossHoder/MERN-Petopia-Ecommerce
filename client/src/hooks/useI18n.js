import { useTranslation } from 'react-i18next';

/**
 * Custom hook để sử dụng i18n dễ dàng hơn
 * Trả về function translate và các utilities thông dụng
 */
export const useI18n = () => {
    const { t, i18n } = useTranslation();

    return {
        // Function để translate
        t,

        // Ngôn ngữ hiện tại
        currentLanguage: i18n.language,

        // Function để thay đổi ngôn ngữ
        changeLanguage: (lng) => i18n.changeLanguage(lng),

        // Check xem ngôn ngữ hiện tại có phải là tiếng Việt không
        isVietnamese: i18n.language === 'vi',

        // Check xem ngôn ngữ hiện tại có phải là tiếng Anh không
        isEnglish: i18n.language === 'en',

        // Function để format text dựa trên ngôn ngữ
        formatText: (text) => {
            if (i18n.language === 'vi') {
                // Có thể thêm logic format đặc biệt cho tiếng Việt
                return text;
            }
            return text;
        },

        // Function để lấy direction của text (LTR/RTL)
        textDirection: i18n.language === 'ar' ? 'rtl' : 'ltr',
    };
};

export default useI18n;
