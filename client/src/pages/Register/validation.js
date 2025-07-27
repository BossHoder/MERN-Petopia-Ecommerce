import * as Yup from 'yup';

// Register validation schema with confirm password
export const getRegisterSchema = (t) => {
    return Yup.object({
        name: Yup.string()
            .min(2, t('validation.name.minLength'))
            .max(50, t('validation.name.maxLength'))
            .required(t('validation.name.required')),
        username: Yup.string()
            .min(3, t('validation.username.minLength'))
            .max(30, t('validation.username.maxLength'))
            .matches(/^[a-zA-Z0-9_]+$/, t('validation.username.invalid'))
            .required(t('validation.username.required')),
        email: Yup.string()
            .email(t('validation.email.invalid'))
            .min(5, t('validation.email.minLength'))
            .max(255, t('validation.email.maxLength'))
            .required(t('validation.email.required')),
        password: Yup.string()
            .min(6, t('validation.password.minLength'))
            .max(255, t('validation.password.maxLength'))
            .required(t('validation.password.required')),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], t('validation.confirmPassword.match'))
            .required(t('validation.confirmPassword.required')),
    });
};
