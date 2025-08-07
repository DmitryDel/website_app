import axios from 'axios';

// Базовый URL нашего бэкенда
const API_URL = 'http://localhost:8000/api/v1';

// Создаем ЕДИНЫЙ экземпляр axios для всего приложения
const api = axios.create({
  baseURL: API_URL,
});

// Настраиваем перехватчик ОДИН РАЗ здесь
api.interceptors.request.use(config => {
  // Получаем состояние из localStorage, где Zustand его сохраняет
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const token = authStorage?.state?.token;

  // Если токен есть, добавляем его в заголовок Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export default api;