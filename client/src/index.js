import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';

import App from './App';
import './index.css';
import rootReducer from './store/reducers';

const initialState = {};

const store = createStore(
    rootReducer,
    initialState,
    compose(
        applyMiddleware(thunk),
        (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()) ||
            compose,
    ),
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Routes>
                <Route path="/*" element={<App />} />
            </Routes>
        </Router>
    </Provider>,
    document.getElementById('root'),
);
