/**
 * Получает полный URL для изображения
 * @param {string} imagePath - Путь к изображению из базы данных (например, "products/image.jpg")
 * @returns {string|null} - Полный URL изображения или null если путь не указан
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Получаем базовый URL из переменной окружения или используем API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const baseUrl = import.meta.env.VITE_STORAGE_URL || apiUrl.replace('/api', '');
  
  // Кодируем каждый сегмент пути отдельно, чтобы сохранить структуру
  const encodedPath = imagePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
  return `${baseUrl}/storage/${encodedPath}`;
};

