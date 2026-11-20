import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Share2, Bell, ChevronDown, Home } from 'lucide-react';

export default function AppLayout() {
  const { profile, user } = useAuth();
  const { lang, changeLanguage } = useLanguage();
  const initial = profile?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P';
  return <div className="app-shell">
    <Sidebar />
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-context"><Link to="/" className="home-chip"><Home size={18}/></Link><span>Espace de discussion</span><ChevronDown size={15}/></div>
        <div className="topbar-center"><span className="online-dot"/> Pal Intelligence <ChevronDown size={15}/></div>
        <div className="topbar-actions">
          <button className="top-action" type="button"><Share2 size={16}/> Partager</button>
          <button className="top-icon" type="button" aria-label="Notifications"><Bell size={18}/></button>
          {profile?.photoURL ? <img className="avatar-mini" src={profile.photoURL} alt="Photo de profil"/> : <span className="avatar-mini">{initial}</span>}
          <select aria-label="Langue" value={lang} onChange={e => changeLanguage(e.target.value)} className="language-select">
            <option value="fr">FR</option><option value="en">EN</option><option value="ln">LN</option><option value="sw">SW</option>
          </select>
        </div>
      </header>
      <Outlet />
    </main>
  </div>;
}
