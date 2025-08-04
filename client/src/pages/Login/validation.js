import * as Yup from 'yup';

export const getLoginSchema = (t) => {
    return Yup.object({
        email: Yup.string()
            .email(t('admin.validation.email.invalid'))
            .required(t('admin.validation.email.required')),
        password: Yup.string()
            .min(6, t('admin.validation.password.minLength'))
            .required(t('admin.validation.password.required')),
    });
};
