import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { validEmail, strongPassword } from '../utils/validation';
import Brand from '../components/Brand';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const initialForm = { firstName: '', lastName: '', birthDate: '', gender: '', email: '', password: '' };

export default function AuthPage() {
  const [mode, setMode] = useState('in');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError(''); setNotice('');
    if (!validEmail(form.email)) return setError('Adresse e-mail invalide.');
    if (!strongPassword(form.password)) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (mode === 'up' && (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.gender)) {
      return setError('Veuillez compléter tous les champs obligatoires.');
    }
    setBusy(true);
    try {
      const result = mode === 'in'
        ? await authApi.login({ email: form.email.trim().toLowerCase(), password: form.password })
        : await authApi.register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), birthDate: form.birthDate, gender: form.gender, email: form.email.trim().toLowerCase(), password: form.password });
      const account = result.user || result.account;
      if (!account) throw new Error('Le serveur n’a pas renvoyé le compte utilisateur attendu.');
      setAuthenticatedUser(account, result.profile || account);
      nav('/', { replace: true });
    } catch (err) {
      const messages = {
        'EMAIL_EXISTS': 'Cette adresse e-mail possède déjà un compte.',
        'INVALID_CREDENTIALS': 'Adresse e-mail ou mot de passe incorrect.',
        'VALIDATION_ERROR': 'Certaines informations sont invalides.',
        'RATE_LIMITED': 'Trop de tentatives. Réessayez un peu plus tard.'
      };
      setError(messages[err.code] || err.message || 'Impossible de communiquer avec le serveur OpenDC.');
    } finally { setBusy(false); }
  }

  async function reset() {
    setError(''); setNotice('');
    if (!validEmail(form.email)) return setError('Saisissez d’abord une adresse e-mail valide.');
    setBusy(true);
    try {
      await authApi.forgotPassword(form.email.trim().toLowerCase());
      setNotice('Si un compte correspond à cette adresse, un message de réinitialisation sera envoyé.');
    } catch (err) { setError(err.message || 'Impossible de demander la réinitialisation.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page"><div className="auth-visual"><Brand/><div className="auth-visual-copy"><span className="eyebrow">INNOVATION · CONNEXION · AVENIR</span><h1>Ouvrir la RDC<br/>au monde <em>numérique.</em></h1><p>Créer nos propres technologies. Connecter les talents. Transformer les possibilités.</p><div className="visual-orbit">∞</div></div><div className="auth-foot">Une initiative technologique née en République démocratique du Congo.</div></div><div className="auth-side"><div className="auth-box"><Brand small/><span className="eyebrow blue">VOTRE ESPACE OPEN­DC</span><h2>{mode === 'in' ? 'Connexion à OpenDC' : 'Créer un compte'}</h2><p className="muted">{mode === 'in' ? 'Connectez-vous pour accéder à votre espace.' : 'Rejoignez la communauté OpenDC.'}</p>{error && <div className="form-error" role="alert">{error}</div>}{notice && <div className="success-message" role="status">{notice}</div>}<form onSubmit={submit}>{mode === 'up' && <><div className="form-grid"><label>Nom<input name="lastName" value={form.lastName} onChange={change} autoComplete="family-name" required/></label><label>Prénom<input name="firstName" value={form.firstName} onChange={change} autoComplete="given-name" required/></label></div><label>Date de naissance<input type="date" name="birthDate" value={form.birthDate} onChange={change} required/></label><label>Genre<select name="gender" value={form.gender} onChange={change} required><option value="">Sélectionner</option><option value="female">Femme</option><option value="male">Homme</option><option value="other">Autre</option><option value="prefer_not_say">Je préfère ne pas préciser</option></select></label></>}<label>Adresse e-mail<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required/></label><label>Mot de passe<input type="password" name="password" value={form.password} onChange={change} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength="8" required/></label>{mode === 'in' && <button type="button" className="text-button reset" onClick={reset} disabled={busy}>Mot de passe oublié ?</button>}<button className="primary-button full" disabled={busy}>{busy ? 'Veuillez patienter…' : mode === 'in' ? 'Se connecter' : 'Créer mon compte'}<ArrowRight size={17}/></button></form><div className="auth-switch">{mode === 'in' ? 'Vous n’avez pas encore de compte ?' : 'Vous avez déjà un compte ?'} <button onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(''); setNotice(''); }}>{mode === 'in' ? 'Créer un compte' : 'Se connecter'}</button></div><div className="secure-note"><ShieldCheck size={15}/> Authentification OpenDC gérée par le serveur</div></div></div></div>;
}
