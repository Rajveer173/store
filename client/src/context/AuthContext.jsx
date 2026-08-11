import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (!tokenStorage.get()) {
        setInitialising(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) {
          setInitialising(false);
        }
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    tokenStorage.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    tokenStorage.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, initialising, login, register, logout }),
    [user, initialising, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
