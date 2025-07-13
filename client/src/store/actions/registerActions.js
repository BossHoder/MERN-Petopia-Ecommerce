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
        history.push('/login');
    } catch (err) {
        dispatch({
            type: REGISTER_WITH_EMAIL_FAIL,
            payload: { error: err?.response?.data.message || err.message },
        });
    }
};
