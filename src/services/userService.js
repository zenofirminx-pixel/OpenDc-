import { apiRequest, profileApi } from './api';

export async function saveUserProfile(_uid, data) {
  const result = await profileApi.update({
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate: data.birthDate || '',
    gender: data.gender || ''
  });

  return result.profile;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire cette image.'));
    };

    image.src = url;
  });
}

function canvasToWebP(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('La compression WebP a échoué.'));
        return;
      }

      if (blob.type !== 'image/webp') {
        reject(new Error('Votre navigateur ne prend pas en charge la compression WebP.'));
        return;
      }

      resolve(blob);
    }, 'image/webp', quality);
  });
}

async function compressAvatar(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Choisissez un fichier image.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image originale limitée à 10 Mo.');
  }

  const image = await loadImage(file);

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Compression indisponible.');

  const cropSize = Math.min(image.width, image.height);
  const x = (image.width - cropSize) / 2;
  const y = (image.height - cropSize) / 2;

  context.drawImage(
    image,
    x, y, cropSize, cropSize,
    0, 0, size, size
  );

  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    const blob = await canvasToWebP(canvas, quality);

    if (blob.size <= 120 * 1024) {
      return new File([blob], 'avatar.webp', {
        type: 'image/webp'
      });
    }
  }

  throw new Error('Cette image reste trop volumineuse après compression.');
}

export async function uploadAvatar(_uid, file) {
  const compressed = await compressAvatar(file);

  const form = new FormData();
  form.append('avatar', compressed);

  const result = await apiRequest('/api/profile/avatar', {
    method: 'POST',
    body: form
  });

  return result.photoURL;
}
