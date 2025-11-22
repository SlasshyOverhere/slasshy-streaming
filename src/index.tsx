import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Check if Auth0 environment variables are properly set
const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

if (!auth0Domain || !auth0ClientId) {
  console.error("Auth0 configuration missing. Please check your environment variables.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain || ''}
      clientId={auth0ClientId || ''}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage" // Use localStorage for better persistence
      useRefreshTokens={true} // Enable refresh tokens for better session management
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);