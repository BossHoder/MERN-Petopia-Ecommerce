// ===========================================
// REDUX STORE CONFIGURATION
// ===========================================
// Main store setup with all reducers and middleware

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';
import { thunk } from 'redux-thunk';

// Import reducers
import notificationReducer from './reducers/notificationReducer';

// Combine all reducers
const rootReducer = combineReducers({
    notifications: notificationReducer,
    // Add other reducers here as needed
    // auth: authReducer,
    // products: productReducer,
    // cart: cartReducer,
    // etc...
});

// Configure store with middleware
const middleware = [thunk];

// Enhanced store configuration with fallback
const enhancer =
    process.env.NODE_ENV === 'development'
        ? composeWithDevTools(applyMiddleware(...middleware))
        : applyMiddleware(...middleware);

const store = createStore(rootReducer, enhancer);

export { store };
export default store;
