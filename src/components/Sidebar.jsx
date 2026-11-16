import { NavLink, useNavigate } from 'react-router-dom';
import { House, Layers, BriefcaseBusiness, MessageCircle, UserRound, Settings, LogOut, Menu, X, Newspaper } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import Brand from './Brand';
import { useState } from 'react';

export default function Sidebar() {
  const { t } = useLanguage();
  const { clearSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const links = [['/', House, t('home')], ['/projects', Layers, t('projects')], ['/services', BriefcaseBusiness, t('services')], ['/assistant', MessageCircle, t('assistant')], ['/profile', UserRound, t('profile')], ['/news', Newspaper, 'Actualités'], ['/settings', Settings, t('settings')]];
  async function logout() {
    if (busy) return;
    setBusy(true);
    try { await authApi.logout(); } catch (error) { console.error('Déconnexion serveur:', error); }
    finally { clearSession(); setBusy(false); nav('/auth', { replace: true }); }
  }
  return <><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu">{open ? <X/> : <Menu/>}</button><aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><Brand/><div className="nav-label">ESPACE PERSONNEL</div><nav>{links.map(([to, Icon, label]) => <NavLink onClick={() => setOpen(false)} end={to === '/'} key={to} to={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><button className="logout" onClick={logout} disabled={busy}><LogOut size={18}/>{busy ? 'Déconnexion…' : t('logout')}</button><div className="sidebar-foot">OpenDC · Version 1.0</div></aside>{open && <div className="backdrop" onClick={() => setOpen(false)}/>}</>;
}
