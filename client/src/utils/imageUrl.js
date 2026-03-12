/**
 * Utility to resolve image URLs.
 * If the path is relative (e.g., /uploads/xyz.png), it resolves it 
 * according to the environment.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // If apiUrl ends with /api, we want the server root which is one level up
  const serverUrl = apiUrl.replace(/\/api\/?$/, '');
  
  const cleanBase = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};
