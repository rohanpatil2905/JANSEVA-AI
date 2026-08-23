import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentSession,
  login as authLogin,
  logout as authLogout,
  switchOfficerRole,
  PERMISSIONS,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getCurrentSession();
    if (current) {
      setSession(current);
    }
    setLoading(false);
  }, []);

  const login = async credentials => {
    const newSession = await authLogin(credentials);
    setSession(newSession);
    return newSession;
  };

  const logout = async () => {
    await authLogout();
    setSession(null);
  };

  const switchRole = async roleName => {
    const newSession = await switchOfficerRole(roleName);
    setSession(newSession);
    return newSession;
  };

  const user = session?.user || null;
  const isAuthenticated = !!user;

  const hasRole = roles => {
    if (!user) return false;
    if (!roles) return true;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(user.role);
  };

  const hasPermission = permission => {
    if (!user) return false;
    if (!user.permissions) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        switchRole,
        hasRole,
        hasPermission,
        PERMISSIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
