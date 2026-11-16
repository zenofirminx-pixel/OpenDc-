import { config } from '../config/env';

/** All authenticated requests use the server-managed HttpOnly session cookie. */
export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!config.apiBaseUrl) throw new Error('L’adresse du serveur OpenDC n’est pas configurée.');
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Erreur serveur (${response.status}).`);
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const authApi = {
  me: () => apiRequest('/api/auth/me'),
  register: data => apiRequest('/api/auth/register', { method: 'POST', body: data }),
  login: data => apiRequest('/api/auth/login', { method: 'POST', body: data }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  forgotPassword: email => apiRequest('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: data => apiRequest('/api/auth/reset-password', { method: 'POST', body: data }),
  changePassword: data => apiRequest('/api/auth/change-password', { method: 'POST', body: data })
};

export const assistantApi = { send: (message, history = []) => apiRequest('/api/assistant/chat', { method: 'POST', body: { message, history } }) };
export const profileApi = { get: () => apiRequest('/api/profile'), update: data => apiRequest('/api/profile', { method: 'PATCH', body: data }) };
export const projectsApi = { list: () => apiRequest('/api/projects') };
export const newsApi = { list: () => apiRequest('/api/news') };
export const servicesApi = { list: () => apiRequest('/api/services') };
