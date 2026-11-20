
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, profileApi } from '../services/api';
const C = createContext(null);
export const useAuth = () => useContext(C);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshProfile = useCallback(async () => {
    const data = await profileApi.get();
    setProfile(data.profile || null);
    return data.profile || null;
  }, []);
  const refreshSession = useCallback(async () => {
    try {
      const data = await authApi.me();
      const next = data.user || null;
      setUser(next);
      if (next) {
        try { await refreshProfile(); } catch { setProfile(next); }
      } else setProfile(null);
      return next;
    } catch (error) {
      if (error.status !== 401) console.warn('Session Pal indisponible:', error);
      setUser(null); setProfile(null); return null;
    } finally { setLoading(false); }
  }, [refreshProfile]);
  useEffect(() => { refreshSession(); }, [refreshSession]);
  const value = { user, profile, loading, refreshProfile, refreshSession, updateLocalProfile: setProfile, setUser };
  return <C.Provider value={value}>{children}</C.Provider>;
}
