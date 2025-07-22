import * as Yup from 'yup';

// Sử dụng: getRegisterSchema(t) với t là hàm dịch từ useI18n
export const getRegisterSchema = (t) => {
    return Yup.object({
        name: Yup.string()
            .min(2, t('auth.register.validation.nameMin'))
            .max(50, t('auth.register.validation.nameMax'))
            .required(t('auth.register.validation.nameRequired')),
        username: Yup.string()
            .min(3, t('auth.register.validation.usernameMin'))
            .max(30, t('auth.register.validation.usernameMax'))
            .matches(/^[a-zA-Z0-9_]+$/, t('auth.register.validation.usernamePattern'))
            .required(t('auth.register.validation.usernameRequired')),
        email: Yup.string()
            .email(t('auth.register.validation.emailInvalid'))
            .min(5, t('auth.register.validation.emailMin'))
            .max(255, t('auth.register.validation.emailMax'))
            .required(t('auth.register.validation.emailRequired')),
        password: Yup.string()
            .min(6, t('auth.register.validation.passwordMin'))
            .max(255, t('auth.register.validation.passwordMax'))
            .required(t('auth.register.validation.passwordRequired')),
    });
};
