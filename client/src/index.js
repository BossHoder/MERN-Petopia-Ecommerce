import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { HelmetProvider } from 'react-helmet-async'; // eslint-disable-line

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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <HelmetProvider>
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/*" element={<App />} />
                </Routes>
            </Router>
        </Provider>
    </HelmetProvider>,
);
