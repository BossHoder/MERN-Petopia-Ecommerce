import * as Yup from 'yup';

export const getProfileSchema = (t) => {
    return Yup.object({
        name: Yup.string()
            .min(2, t('validation.name.minLength'))
            .max(30, t('validation.name.maxLength'))
            .required(t('validation.name.required')),
        username: Yup.string()
            .min(2, t('validation.username.minLength'))
            .max(20, t('validation.username.maxLength'))
            .matches(/^[a-zA-Z0-9_]+$/, t('validation.username.invalid'))
            .required(t('validation.username.required')),
        password: Yup.string()
            .min(6, t('validation.password.minLength'))
            .max(20, t('validation.password.maxLength')),
    });
};
