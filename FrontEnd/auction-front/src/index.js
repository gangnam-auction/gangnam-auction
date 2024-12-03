import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CookiesProvider } from 'react-cookie';
import { SignupProvider } from './pages/signup/SignupContext';
import { LoginProvider } from './pages/login/LoginContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CookiesProvider>
        <SignupProvider>
            <LoginProvider>
                    <App />
            </LoginProvider>
        </SignupProvider>
    </CookiesProvider>
);