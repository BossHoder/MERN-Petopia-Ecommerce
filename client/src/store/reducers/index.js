import { combineReducers } from 'redux';

import authReducer from './authReducer';
import registerReducer from './registerReducer';
import userReducer from './userReducer';
import usersReducer from './usersReducer';
import messageReducer from './messageReducer';
import productReducer from './productReducer';
import categoryReducer from './categoryReducer';
import cartReducer from './cartReducer';
import {
    orderCreateReducer,
    orderDetailsReducer,
    orderPayReducer,
    orderListMyReducer,
} from './orderReducer';
import { addressReducer } from './addressReducer';
import { reviewListReducer, reviewAddReducer } from './reviewReducer';
import toastReducer from './toastReducer';

export default combineReducers({
    auth: authReducer,
    register: registerReducer,
    user: userReducer,
    users: usersReducer,
    messages: messageReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    orderCreate: orderCreateReducer,
    orderDetails: orderDetailsReducer,
    orderPay: orderPayReducer,
    orderListMy: orderListMyReducer,
    address: addressReducer,
    reviewList: reviewListReducer,
    reviewAdd: reviewAddReducer,
    toast: toastReducer,
});
