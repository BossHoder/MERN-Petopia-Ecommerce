import API from '../../services/api';

import {
    REGISTER_WITH_EMAIL_LOADING,
    REGISTER_WITH_EMAIL_SUCCESS,
    REGISTER_WITH_EMAIL_FAIL,
} from '../types';

export const registerUserWithEmail = (formData, history) => async (dispatch, getState) => {
    dispatch({ type: REGISTER_WITH_EMAIL_LOADING });
    try {
        await API.post('/auth/register', formData);
        dispatch({
            type: REGISTER_WITH_EMAIL_SUCCESS,
        });
        history('/login');
    } catch (err) {
        let errorMessage = 'Có lỗi xảy ra trong quá trình đăng ký';

        if (err.response?.data) {
            // Backend trả về lỗi có cấu trúc
            errorMessage = err.response.data.message || errorMessage;

            // Xử lý các lỗi cụ thể
            if (err.response.status === 422) {
                if (errorMessage.includes('Email already exists')) {
                    errorMessage = 'Email này đã được sử dụng';
                } else if (errorMessage.includes('Username already exists')) {
                    errorMessage = 'Tên đăng nhập này đã được sử dụng';
                } else if (errorMessage.includes('validation')) {
                    errorMessage = 'Dữ liệu nhập vào không hợp lệ';
                }
            }
        } else if (err.message) {
            errorMessage = err.message;
        }

        dispatch({
            type: REGISTER_WITH_EMAIL_FAIL,
            payload: { error: errorMessage },
        });
    }
};
