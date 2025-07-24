import * as Yup from 'yup';

// Register validation schema with confirm password
export const getRegisterSchema = (t) => {
    return Yup.object({
        name: Yup.string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name must be at most 50 characters')
            .required('Full name is required'),
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must be at most 30 characters')
            .matches(
                /^[a-zA-Z0-9_]+$/,
                'Username can only contain letters, numbers, and underscores',
            )
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email address')
            .min(5, 'Email must be at least 5 characters')
            .max(255, 'Email must be at most 255 characters')
            .required('Email address is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .max(255, 'Password must be at most 255 characters')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Please confirm your password'),
    });
};
