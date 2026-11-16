
import { apiRequest, profileApi } from './api';
export async function saveUserProfile(_uid, data) {
  const result = await profileApi.update({
    firstName: data.firstName, lastName: data.lastName,
    birthDate: data.birthDate || '', gender: data.gender || '',
    photoURL: data.photoURL || ''
  });
  return result.profile;
}
export async function uploadAvatar(_uid, file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choisissez un fichier image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image limitée à 5 Mo.');
  const form = new FormData();
  form.append('avatar', file);
  const result = await apiRequest('/api/profile/avatar', { method: 'POST', body: form });
  return result.photoURL;
}
