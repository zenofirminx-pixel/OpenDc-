import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, profileApi } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const result = await profileApi.get();
      const nextProfile = result.profile || result.user || result;
      setProfile(nextProfile);
      if (nextProfile?.email || nextProfile?.uid || nextProfile?.id) {
        setUser(current => current ? { ...current, ...nextProfile } : nextProfile);
      }
      return nextProfile;
    } catch (error) {
      if (error.status !== 401) console.error('Impossible de charger le profil OpenDC:', error);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const result = await authApi.me();
      const currentUser = result.user || result.account || null;
      setUser(currentUser);
      setProfile(result.profile || currentUser || null);
      return currentUser;
    } catch (error) {
      if (error.status !== 401) console.error('Vérification de session OpenDC impossible:', error);
      setUser(null);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshSession(); }, [refreshSession]);

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    refreshSession,
    updateLocalProfile: setProfile,
    setAuthenticatedUser: (nextUser, nextProfile = nextUser) => {
      setUser(nextUser);
      setProfile(nextProfile);
    },
    clearSession: () => { setUser(null); setProfile(null); }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
