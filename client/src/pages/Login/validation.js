import * as Yup from 'yup';

export const getLoginSchema = (t) => {
    return Yup.object({
        email: Yup.string()
            .email(t('validation.email.invalid'))
            .required(t('validation.email.required')),
        password: Yup.string()
            .min(6, t('validation.password.minLength'))
            .required(t('validation.password.required')),
    });
};
