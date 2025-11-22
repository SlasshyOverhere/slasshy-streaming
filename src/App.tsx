import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const { loginWithRedirect, logout, user, isLoading, isAuthenticated } = useAuth0();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Handle long loading times
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center px-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-white text-lg">Verifying authentication...</p>
          <p className="text-neutral-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // If still loading after timeout, show login screen
  if (isLoading && loadingTimeout) {
    return <LoginScreen onLogin={loginWithRedirect} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={loginWithRedirect} />;
  }

  // Map Auth0 user to our User type
  const mappedUser: User = {
    email: user?.email || '',
    name: user?.name || 'Unknown User',
    avatarUrl: user?.picture
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Dashboard user={mappedUser} onLogout={handleLogout} />
  );
};

export default App;
