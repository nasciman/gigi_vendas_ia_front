import { API_HOST } from '../constants/Api';

export function resolvePhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) return photoPath;
  return `${API_HOST}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
}
