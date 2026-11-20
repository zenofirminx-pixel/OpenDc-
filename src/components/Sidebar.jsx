import { NavLink, useNavigate } from 'react-router-dom';
import { House, Search, BookOpen, Folder, Image, CalendarDays, Puzzle, Crown, MessageSquare, UserRound, Settings, LogOut, Menu, X, Plus, ChevronRight } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Brand from './Brand';
import { useState } from 'react';
export default function Sidebar() {
  const { setUser, updateLocalProfile, profile, user } = useAuth();
  const [open, setOpen] = useState(false); const nav = useNavigate();
  const links = [['/', House, 'Accueil'], ['/projects', Folder, 'Projets'], ['/services', Puzzle, 'Outils IA'], ['/assistant', MessageSquare, 'Discussion'], ['/news', BookOpen, 'Découvrir'], ['/profile', UserRound, 'Profil'], ['/settings', Settings, 'Paramètres']];
  async function logout() { try { await authApi.logout(); } finally { setUser(null); updateLocalProfile(null); nav('/auth'); } }
  const name = profile?.firstName || user?.displayName?.split(' ')[0] || 'Mon compte';
  return <><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu">{open ? <X/> : <Menu/>}</button>
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand/><button className="collapse-button" aria-label="Réduire le menu">«</button></div>
      <NavLink to="/assistant" className="new-chat" onClick={() => setOpen(false)}><Plus size={20}/> Nouvelle conversation</NavLink>
      <nav className="primary-nav">{links.map(([to, Icon, label]) => <NavLink onClick={() => setOpen(false)} end={to === '/'} key={to} to={to}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-section"><div className="sidebar-section-title">CONVERSATIONS RÉCENTES <ChevronRight size={15}/></div>
        <NavLink to="/assistant" className="recent-chat"><MessageSquare size={15}/><span>Nouvelle conversation</span><small>2 min</small></NavLink>
        <NavLink to="/assistant" className="recent-chat"><MessageSquare size={15}/><span>Idées et inspiration</span><small>12 min</small></NavLink>
      </div>
      <div className="sidebar-bottom">
        <NavLink to="/settings" className="account-link"><span className="account-avatar">{name[0]?.toUpperCase() || 'P'}</span><span><b>{name}</b><small><Crown size={11}/> Compte Pal</small></span><Settings size={18}/></NavLink>
        <button className="logout" onClick={logout}><LogOut size={17}/> Déconnexion</button>
        <div className="sidebar-foot">Pal · Votre intelligence, sans limites.</div>
      </div>
    </aside>{open && <div className="backdrop" onClick={() => setOpen(false)}/>}</>;
}
