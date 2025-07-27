import * as Yup from 'yup';

export const getMessageFormSchema = (t) => {
    return Yup.object({
        text: Yup.string()
            .min(5, t('validation.message.minLength'))
            .max(300, t('validation.message.maxLength'))
            .required(t('validation.message.required')),
    });
};
