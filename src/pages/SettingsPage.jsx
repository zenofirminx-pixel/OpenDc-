import { useState } from 'react';
import { Globe, ShieldCheck, Lock, KeyRound, Copy, RefreshCw, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

export default function SettingsPage() {
  const { lang, changeLanguage } = useLanguage();
  const { user, refreshSession } = useAuth();

  const [setupPassword, setSetupPassword] = useState('');
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [managementCode, setManagementCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const enabled = Boolean(user?.twoFactorEnabled);

  async function startSetup(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const result = await authApi.setupTwoFactor(setupPassword);
      setSetup(result);
      setSetupPassword('');
      setNotice('Scannez le QR code avec votre application d’authentification.');
    } catch (err) {
      setError(err.message || 'Impossible de démarrer la configuration.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const result = await authApi.confirmTwoFactor(code);
      setRecoveryCodes(result.recoveryCodes || []);
      setSetup(null);
      setCode('');
      setNotice('La double authentification est activée.');
      await refreshSession();
    } catch (err) {
      setError(err.message || 'Code de vérification incorrect.');
    } finally {
      setBusy(false);
    }
  }

  async function manageTwoFactor(action) {
    if (!currentPassword || !managementCode) {
      setError('Saisissez votre mot de passe et votre code de vérification.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      if (action === 'disable') {
        const result = await authApi.disableTwoFactor(currentPassword, managementCode);
        setNotice(result.message || 'La double authentification a été désactivée.');
        setRecoveryCodes([]);
        await refreshSession();
      } else {
        const result = await authApi.regenerateTwoFactorRecoveryCodes(currentPassword, managementCode);
        setRecoveryCodes(result.recoveryCodes || []);
        setNotice('Vos nouveaux codes de récupération sont prêts. Les anciens ne sont plus valides.');
      }

      setCurrentPassword('');
      setManagementCode('');
    } catch (err) {
      setError(err.message || 'Opération impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setNotice('Les codes ont été copiés.');
    } catch {
      setError('Copie impossible. Sélectionnez les codes manuellement.');
    }
  }

  function downloadCodes() {
    if (!recoveryCodes.length) return;

    const data = {
      application: 'OpenDC',
      type: 'two-factor-recovery-codes',
      generatedAt: new Date().toISOString(),
      codes: recoveryCodes
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'opendc-recovery-codes.json';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Fichier JSON téléchargé. Conservez-le dans un endroit sûr.');
  }

  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow blue">PRÉFÉRENCES</span>
        <h1>Paramètres</h1>
        <p>Personnalisez votre expérience OpenDC.</p>
      </div>

      <section className="settings-card">
        <div className="settings-icon"><Globe /></div>
        <div>
          <h3>Langue de l’interface</h3>
          <p>Choisissez la langue à utiliser dans votre espace.</p>
          <select value={lang} onChange={e => changeLanguage(e.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ln">Lingala</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>
      </section>

      <section className="settings-card twofactor-card">
        <div className="settings-icon"><ShieldCheck /></div>
        <div className="twofactor-content">
          <h3>Authentification à deux facteurs (2FA)</h3>
          <p>
            Renforcez la sécurité de votre compte avec une application
            d’authentification. Un code supplémentaire sera demandé lors
            de vos prochaines connexions.
          </p>

          <div className={enabled ? 'twofactor-status enabled' : 'twofactor-status'}>
            <span />
            {enabled ? 'Double authentification activée' : 'Double authentification désactivée'}
          </div>

          {error && <p className="twofactor-error">{error}</p>}
          {notice && <p className="twofactor-notice">{notice}</p>}

          {!enabled && !setup && (
            <form onSubmit={startSetup} className="twofactor-form">
              <label htmlFor="setup-password">Mot de passe actuel</label>
              <input
                id="setup-password"
                type="password"
                autoComplete="current-password"
                value={setupPassword}
                onChange={e => setSetupPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
              <button className="primary-button" disabled={busy}>
                <Lock size={16} /> {busy ? 'Préparation...' : 'Configurer la 2FA'}
              </button>
            </form>
          )}

          {!enabled && setup && (
            <div className="twofactor-setup">
              <h4>1. Scannez ce QR code</h4>
              {setup.qrCode && (
                <img className="twofactor-qr" src={setup.qrCode} alt="QR code de configuration 2FA" />
              )}

              <h4>2. Ou saisissez cette clé manuellement</h4>
              <code className="twofactor-secret">{setup.manualEntryKey}</code>

              <p>La configuration expire dans 10 minutes. Ne partagez jamais cette clé.</p>

              <form onSubmit={confirmSetup} className="twofactor-form">
                <label htmlFor="setup-code">Code à 6 chiffres de votre application</label>
                <input
                  id="setup-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  minLength={6}
                  maxLength={6}
                />
                <button className="primary-button" disabled={busy || code.length !== 6}>
                  {busy ? 'Vérification...' : 'Confirmer et activer'}
                </button>
              </form>
            </div>
          )}

          {enabled && (
            <div className="twofactor-management">
              <h4><KeyRound size={17} /> Gestion des codes de récupération</h4>
              <p>
                Les codes de récupération permettent de retrouver l’accès
                au compte si votre application d’authentification est indisponible.
              </p>

              <div className="twofactor-form">
                <label htmlFor="management-password">Mot de passe actuel</label>
                <input
                  id="management-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                />

                <label htmlFor="management-code">Code 2FA ou code de récupération</label>
                <input
                  id="management-code"
                  value={managementCode}
                  onChange={e => setManagementCode(e.target.value)}
                  placeholder="Code de vérification"
                  autoComplete="one-time-code"
                />

                <button type="button" className="primary-button" disabled={busy} onClick={() => manageTwoFactor('regenerate')}>
                  <RefreshCw size={16} /> Renouveler les codes
                </button>

                <button type="button" className="twofactor-danger" disabled={busy} onClick={() => {
                  if (window.confirm('Voulez-vous vraiment désactiver la double authentification ?')) {
                    manageTwoFactor('disable');
                  }
                }}>
                  Désactiver la 2FA
                </button>
              </div>
            </div>
          )}

          {recoveryCodes.length > 0 && (
            <div className="recovery-codes">
              <h4>Vos codes de récupération</h4>
              <p>
                Conservez ces codes dans un endroit sûr. Ils ne seront plus
                affichés après avoir quitté cette page. Chaque code ne peut
                être utilisé qu’une seule fois.
              </p>
              <div className="recovery-code-list">
                {recoveryCodes.map((item, index) => (
                  <code key={index}>{item}</code>
                ))}
              </div>
              <div className="twofactor-actions">
                <button type="button" className="primary-button" onClick={copyCodes}>
                  <Copy size={16} /> Copier les codes
                </button>
                <button type="button" className="primary-button" onClick={downloadCodes}>
                  <Download size={16} /> Télécharger en JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-icon"><ShieldCheck /></div>
        <div>
          <h3>Sécurité du compte</h3>
          <p>
            OpenDC utilise des sessions serveur sécurisées. Les mots de passe
            sont hachés avec Argon2id et ne sont jamais enregistrés en clair
            dans Firestore.
          </p>
        </div>
      </section>
    </div>
  );
}
