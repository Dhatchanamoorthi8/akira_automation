import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

export const PortalAuthShell: React.FC = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default PortalAuthShell;
