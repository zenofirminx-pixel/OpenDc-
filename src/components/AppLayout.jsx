import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function AppLayout() {
  const { profile, user } = useAuth();
  const { lang, changeLanguage } = useLanguage();

  const initial =
    profile?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'O';

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-note">
            Construire aujourd’hui les technologies de demain.
          </div>

          <div className="topbar-actions">
            <Globe size={16} />

            <select
              aria-label="Langue"
              value={lang}
              onChange={e => changeLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ln">Lingala</option>
              <option value="sw">Kiswahili</option>
            </select>

            {profile?.photoURL ? (
              <img
                className="avatar-mini"
                src={profile.photoURL}
                alt="Photo de profil"
              />
            ) : (
              <span className="avatar-mini">
                {initial}
              </span>
            )}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
