
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { validEmail, strongPassword } from '../utils/validation';
import Brand from '../components/Brand';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [search] = useSearchParams();
  const resetToken = search.get('token') || '';
  const initialMode = useMemo(() => resetToken ? 'reset' : 'in', [resetToken]);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ firstName: '', lastName: '', birthDate: '', gender: '', email: '', password: '', currentPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const nav = useNavigate();
  const { refreshSession } = useAuth();
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function resendVerification() { setError(''); setNotice(''); try { const result = await authApi.resendVerification(form.email); setNotice(result.message); } catch (err) { setError(err.message); } }
  async function submit(e) {
    e.preventDefault(); setError(''); setNotice('');
    if (mode !== 'forgot' && mode !== 'reset' && !validEmail(form.email)) { setError('Adresse e-mail invalide.'); return; }
    if (mode === 'up' && (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.gender)) { setError('Veuillez compléter tous les champs obligatoires.'); return; }
    if ((mode === 'up' || mode === 'reset') && !strongPassword(form.password)) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setBusy(true);
    try {
      if (mode === 'in') {
        if (twoFactorStep) {
          await authApi.verifyLoginTwoFactor(twoFactorCode.trim());
          await refreshSession();
          nav('/');
        } else {
          const result = await authApi.login({ email: form.email, password: form.password });
          if (result.twoFactorRequired) {
            setTwoFactorStep(true);
            setTwoFactorCode('');
            setNotice('Votre compte est protégé par la double authentification. Saisissez votre code.');
            return;
          }
          await refreshSession();
          nav('/');
        }
      } else if (mode === 'up') {
        await authApi.register({ firstName: form.firstName, lastName: form.lastName, birthDate: form.birthDate, gender: form.gender, email: form.email, password: form.password });
        const sessionUser = await refreshSession();

        if (sessionUser) {
          nav('/');
        } else {
          setNotice('Compte créé, mais la connexion automatique n’a pas pu être confirmée. Connectez-vous avec vos identifiants.');
          setMode('in');
        }
      } else if (mode === 'forgot') {
        const result = await authApi.forgotPassword(form.email);
        setNotice(result.message);
      } else {
        const result = await authApi.resetPassword(resetToken, form.password);
        setNotice(result.message); setMode('in');
        window.history.replaceState({}, '', '/auth');
      }
    } catch (err) {
      const map = {
        EMAIL_ALREADY_EXISTS: 'Cette adresse e-mail possède déjà un compte.',
        INVALID_CREDENTIALS: 'Adresse e-mail ou mot de passe incorrect.',
        EMAIL_NOT_VERIFIED: 'Vérifiez votre adresse e-mail avant de vous connecter.',
        INVALID_ACTION_TOKEN: 'Ce lien est invalide ou expiré.'
      };
      setError(map[err.code] || err.message || 'Une erreur est survenue.');
    } finally { setBusy(false); }
  }
  const title = mode === 'in' ? 'Connexion à OpenDC' : mode === 'up' ? 'Créer un compte' : mode === 'forgot' ? 'Mot de passe oublié' : 'Nouveau mot de passe';
  return <div className="auth-page">
    <div className="auth-visual"><Brand/><div className="auth-visual-copy"><span className="eyebrow">INNOVATION · CONNEXION · AVENIR</span><h1>Ouvrir la RDC<br/>au monde <em>numérique.</em></h1><p>Créer nos propres technologies. Connecter les talents. Transformer les possibilités.</p><div className="visual-orbit">∞</div></div><div className="auth-foot">Une initiative technologique née en République démocratique du Congo.</div></div>
    <div className="auth-side"><div className="auth-box"><Brand small/><span className="eyebrow blue">VOTRE ESPACE OPEN­DC</span><h2>{title}</h2><p className="muted">{mode === 'in' ? 'Connectez-vous pour accéder à votre espace.' : mode === 'up' ? 'Rejoignez la communauté OpenDC.' : mode === 'forgot' ? 'Recevez un lien sécurisé par e-mail.' : 'Choisissez un nouveau mot de passe.'}</p>
      {error && <div className="form-error">{error}</div>}{notice && <div className="success-message">{notice}</div>}
      <form onSubmit={submit}>
        {mode === 'up' && <><div className="form-grid"><label>Nom<input name="lastName" value={form.lastName} onChange={change} required/></label><label>Prénom<input name="firstName" value={form.firstName} onChange={change} required/></label></div><label>Date de naissance<input type="date" name="birthDate" value={form.birthDate} onChange={change} required/></label><label>Genre<select name="gender" value={form.gender} onChange={change} required><option value="">Sélectionner</option><option value="female">Femme</option><option value="male">Homme</option><option value="other">Autre</option><option value="prefer_not_say">Je préfère ne pas préciser</option></select></label></>}
        {mode === 'in' && twoFactorStep ? (
          <label>Code de vérification
            <input
              type="text"
              name="twoFactorCode"
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value)}
              placeholder="Code à 6 chiffres ou code de récupération"
              autoComplete="one-time-code"
              autoFocus
              required
            />
          </label>
        ) : (
          <>
            {mode !== 'reset' && <label>Adresse e-mail<input type="email" name="email" value={form.email} onChange={change} autoComplete="email" required/></label>}
            {(mode === 'in' || mode === 'up' || mode === 'reset') && <label>{mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}<input type="password" name="password" value={form.password} onChange={change} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength="8" required/></label>}
          </>
        )}
        <button className="primary-button full" disabled={busy || (mode === 'in' && twoFactorStep && !twoFactorCode.trim())}>{busy ? 'Veuillez patienter…' : mode === 'in' && twoFactorStep ? 'Vérifier et continuer' : mode === 'in' ? 'Sign In' : mode === 'up' ? 'Créer mon compte' : mode === 'forgot' ? 'Envoyer le lien' : 'Réinitialiser'}<ArrowRight size={17}/></button>
      </form>
      {mode === 'in' && twoFactorStep && <button type="button" className="text-button" onClick={() => { setTwoFactorStep(false); setTwoFactorCode(''); setError(''); setNotice(''); }}>Retour à la connexion</button>}
      {mode === 'in' && !twoFactorStep && notice && <button type="button" className="text-button" onClick={resendVerification}>Renvoyer l’e-mail de vérification</button>}
      {!twoFactorStep && <div className="auth-switch">
        {mode === 'in' ? <>Vous n’avez pas encore de compte ? <button onClick={() => { setMode('up'); setError(''); setNotice(''); }}>Sign Up</button><br/><button onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}>Mot de passe oublié ?</button></> :
        mode === 'up' || mode === 'forgot' ? <>Vous avez déjà un compte ? <button onClick={() => { setMode('in'); setError(''); setNotice(''); }}>Sign In</button></> :
        <button onClick={() => { setMode('in'); setError(''); setNotice(''); }}>Retour à la connexion</button>}
      </div>}
      <div className="secure-note"><ShieldCheck size={15}/> Authentification sécurisée par le serveur OpenDC</div>
    </div></div>
  </div>;
}
