
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi, profileApi } from '../services/api';
import { uploadAvatar } from '../services/userService';
import { Camera, Save } from 'lucide-react';
import StatusNotice from '../components/StatusNotice';
export default function ProfilePage() {
  const { user, profile, refreshProfile, refreshSession } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', birthDate: '', gender: '', email: '' });
  const [file, setFile] = useState(null), [photo, setPhoto] = useState('');
  const [msg, setMsg] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    setForm({ firstName: profile?.firstName || '', lastName: profile?.lastName || '', birthDate: profile?.birthDate || '', gender: profile?.gender || '', email: user?.email || '' });
    setPhoto(profile?.photoURL || '');
  }, [profile, user]);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg(''); setError('');
    try {
      let photoURL = photo;
      if (file) photoURL = await uploadAvatar(user.uid, file);
      await profileApi.update({
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.birthDate,
        gender: form.gender
      });
      await refreshProfile();
      setPhoto(photoURL);
      setFile(null);
      setMsg('Votre profil a été mis à jour.');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function changePass() {
    const currentPassword = prompt('Mot de passe actuel'); if (!currentPassword) return;
    const newPassword = prompt('Nouveau mot de passe (8 caractères minimum)'); if (!newPassword) return;
    if (newPassword.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    try { await authApi.changePassword(currentPassword, newPassword); await refreshSession(); nav('/auth'); }
    catch (err) { setError(err.message); }
  }
  return <div className="page"><div className="page-title"><span className="eyebrow blue">ESPACE PERSONNEL</span><h1>Mon profil</h1><p>Gérez les informations associées à votre compte.</p></div>{error && <div className="form-error">{error}</div>}{msg && <div className="success-message">{msg}</div>}<form className="profile-card" onSubmit={save}><div className="profile-photo"><img src={file ? URL.createObjectURL(file) : photo || '/assets/avatar-placeholder.svg'} alt="Photo de profil"/><label className="camera-button"><Camera size={17}/><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} hidden/></label></div><div className="profile-fields"><div className="form-grid"><label>Nom<input name="lastName" value={form.lastName} onChange={change} required/></label><label>Prénom<input name="firstName" value={form.firstName} onChange={change} required/></label></div><div className="form-grid"><label>Date de naissance<input type="date" name="birthDate" value={form.birthDate} onChange={change}/></label><label>Genre<select name="gender" value={form.gender} onChange={change}><option value="">Non renseigné</option><option value="female">Femme</option><option value="male">Homme</option><option value="other">Autre</option><option value="prefer_not_say">Je préfère ne pas préciser</option></select></label></div><label>Adresse e-mail<input type="email" value={form.email} readOnly/></label><div className="profile-actions"><button className="primary-button" disabled={busy}><Save size={17}/>{busy ? 'Enregistrement…' : 'Enregistrer les modifications'}</button><button type="button" className="secondary-button" onClick={changePass}>Changer le mot de passe</button></div></div></form><StatusNotice>L’adresse e-mail est vérifiée lors de la création du compte. Pour la modifier, une procédure dédiée sera nécessaire.</StatusNotice></div>;
}
