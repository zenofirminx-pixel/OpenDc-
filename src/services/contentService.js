
import { apiRequest } from './api';
const endpoints = { projects: '/api/projects', news: '/api/news', services: '/api/services' };
export async function readPublicCollection(name) {
  const endpoint = endpoints[name];
  if (!endpoint) return [];
  const data = await apiRequest(endpoint);
  return data[name] || data.data || [];
}
