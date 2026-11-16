import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileApi, authApi } from '../services/api';
import { Camera, Save } from 'lucide-react';
import StatusNotice from '../components/StatusNotice';

export default function ProfilePage() {
  const { user, profile, refreshProfile, updateLocalProfile } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', birthDate: '', gender: '', email: '' });
  const [file, setFile] = useState(null);
  const [photo, setPhoto] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({ firstName: profile?.firstName || user?.firstName || '', lastName: profile?.lastName || user?.lastName || '', birthDate: profile?.birthDate || user?.birthDate || '', gender: profile?.gender || user?.gender || '', email: user?.email || profile?.email || '' });
    setPhoto(profile?.photoURL || user?.photoURL || '');
  }, [profile, user]);

  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  async function save(event) {
    event.preventDefault(); setBusy(true); setMsg(''); setError('');
    try {
      // Avatar upload is intentionally routed through the backend in the next server phase.
      if (file) throw new Error('Le téléversement de photo sera activé avec la route sécurisée du serveur.');
      const result = await profileApi.update({ ...form, photoURL: photo });
      const updated = result.profile || result.user || { ...user, ...form, photoURL: photo };
      updateLocalProfile(updated);
      await refreshProfile();
      setMsg('Votre profil a été mis à jour.');
    } catch (err) { setError(err.message || 'Impossible de mettre à jour le profil.'); }
    finally { setBusy(false); }
  }

  async function changePass() {
    const currentPassword = window.prompt('Saisissez votre mot de passe actuel.');
    if (!currentPassword) return;
    const newPassword = window.prompt('Saisissez votre nouveau mot de passe (8 caractères minimum).');
    if (!newPassword) return;
    if (newPassword.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return; }
    setError(''); setMsg('');
    try { await authApi.changePassword({ currentPassword, newPassword }); setMsg('Mot de passe modifié.'); }
    catch (err) { setError(err.message || 'Impossible de modifier le mot de passe.'); }
  }

  return <div className="page"><div className="page-title"><span className="eyebrow blue">ESPACE PERSONNEL</span><h1>Mon profil</h1><p>Gérez les informations associées à votre compte.</p></div>{error && <div className="form-error" role="alert">{error}</div>}{msg && <div className="success-message" role="status">{msg}</div>}<form className="profile-card" onSubmit={save}><div className="profile-photo"><img src={photo || '/assets/avatar-placeholder.svg'} alt="Photo de profil"/><label className="camera-button"><Camera size={17}/><input type="file" accept="image/*" onChange={event => setFile(event.target.files?.[0] || null)} hidden/></label>{file && <small>Photo sélectionnée : {file.name}</small>}</div><div className="profile-fields"><div className="form-grid"><label>Nom<input name="lastName" value={form.lastName} onChange={change} required/></label><label>Prénom<input name="firstName" value={form.firstName} onChange={change} required/></label></div><div className="form-grid"><label>Date de naissance<input type="date" name="birthDate" value={form.birthDate} onChange={change}/></label><label>Genre<select name="gender" value={form.gender} onChange={change}><option value="">Non renseigné</option><option value="female">Femme</option><option value="male">Homme</option><option value="other">Autre</option><option value="prefer_not_say">Je préfère ne pas préciser</option></select></label></div><label>Adresse e-mail<input type="email" name="email" value={form.email} onChange={change} required/></label><div className="profile-actions"><button className="primary-button" disabled={busy}><Save size={17}/>{busy ? 'Enregistrement…' : 'Enregistrer les modifications'}</button><button type="button" className="secondary-button" onClick={changePass}>Changer le mot de passe</button></div></div></form><StatusNotice>Votre compte et votre profil sont gérés par le serveur OpenDC. Les changements sont enregistrés côté serveur.</StatusNotice></div>;
}
