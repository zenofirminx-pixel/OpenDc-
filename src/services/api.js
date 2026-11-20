
import { config } from '../config/env';

let csrfToken = '';
async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${config.apiBaseUrl}/api/auth/csrf`, { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.csrfToken) throw new Error(data.message || 'Impossible de sécuriser la requête.');
  csrfToken = data.csrfToken;
  return csrfToken;
}
export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!config.apiEnabled) throw new Error('Le backend Pal n’est pas activé.');
  const options = { method, credentials: 'include', headers: { Accept: 'application/json', ...headers } };
  if (body instanceof FormData) options.body = body;
  else if (body !== undefined) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) options.headers['X-CSRF-Token'] = await getCsrfToken();
  let response = await fetch(`${config.apiBaseUrl}${path}`, options);
  let data = await response.json().catch(() => ({}));
  if (response.status === 403 && data.code === 'CSRF_INVALID' && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    csrfToken = '';
    options.headers['X-CSRF-Token'] = await getCsrfToken();
    response = await fetch(`${config.apiBaseUrl}${path}`, options);
    data = await response.json().catch(() => ({}));
  }
  if (!response.ok) throw Object.assign(new Error(data.message || `Erreur serveur (${response.status})`), { code: data.code, status: response.status });
  return data;
}
export const authApi = {
  register: data => apiRequest('/api/auth/register', { method: 'POST', body: data }),
  login: data => apiRequest('/api/auth/login', { method: 'POST', body: data }),
  verifyLoginTwoFactor: code => apiRequest('/api/auth/2fa/login', { method: 'POST', body: { code } }),
  setupTwoFactor: currentPassword => apiRequest('/api/auth/2fa/setup', { method: 'POST', body: { currentPassword } }),
  confirmTwoFactor: code => apiRequest('/api/auth/2fa/confirm', { method: 'POST', body: { code } }),
  disableTwoFactor: (currentPassword, code) => apiRequest('/api/auth/2fa/disable', { method: 'POST', body: { currentPassword, code } }),
  regenerateTwoFactorRecoveryCodes: (currentPassword, code) => apiRequest('/api/auth/2fa/recovery-codes/regenerate', { method: 'POST', body: { currentPassword, code } }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/api/auth/me'),
  forgotPassword: email => apiRequest('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resendVerification: email => apiRequest('/api/auth/resend-verification', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => apiRequest('/api/auth/reset-password', { method: 'POST', body: { token, password } }),
  changePassword: (currentPassword, newPassword) => apiRequest('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
};
export const assistantApi = { send: (message, history = []) => apiRequest('/api/assistant/chat', { method: 'POST', body: { message, history } }) };
export const profileApi = { get: () => apiRequest('/api/profile'), update: data => apiRequest('/api/profile', { method: 'PATCH', body: data }) };
export const projectsApi = { list: () => apiRequest('/api/projects') };
export const newsApi = { list: () => apiRequest('/api/news') };
export const servicesApi = { list: () => apiRequest('/api/services') };
