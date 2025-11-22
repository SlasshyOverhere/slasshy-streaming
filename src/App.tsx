import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const { loginWithRedirect, logout, user, isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
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
