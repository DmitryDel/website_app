// import axios from 'axios';
// import api from './api'; // <-- Импортируем наш центральный экземпляр
// import { type LoginData, type RegisterData } from '../types/auth';
//
// // Асинхронная функция для регистрации пользователя
// export const registerUser = async (userData: RegisterData) => {
//   try {
//     // Отправляем POST-запрос на endpoint /users/
//     const response = await api.post('/users/', userData);
//     // Возвращаем данные, которые прислал сервер в случае успеха
//     return response.data;
//   } catch (error) {
//     // Если axios поймал ошибку (например, сервер ответил кодом 4xx или 5xx)
//     if (axios.isAxiosError(error) && error.response) {
//       // Мы "пробрасываем" дальше сообщение об ошибке с бэкенда
//       throw new Error(error.response.data.detail || 'Registration failed');
//     }
//     // Если это была не ошибка axios, а что-то другое
//     throw new Error('An unexpected error occurred');
//   }
// };
//
// // Асинхронная функция для входа
// export const loginUser = async (loginData: LoginData) => {
//   // Для OAuth2PasswordRequestForm данные нужно отправлять как FormData
//   const formData = new FormData();
//   formData.append('username', loginData.email);
//   formData.append('password', loginData.password);
//
//   try {
//     // Отправляем POST-запрос на endpoint /auth/login
//     const response = await api.post('/auth/login', formData);
//     return response.data; // Возвращаем { access_token: "...", token_type: "bearer" }
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response) {
//       throw new Error(error.response.data.detail || 'Login failed');
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

import axios from 'axios';
import api from './api'; // <-- Импортируем наш центральный экземпляр
import { type LoginData, type RegisterData } from '../types/auth';

// const api = axios.create({
//   baseURL: 'http://localhost:8000/api/v1',
//   withCredentials: true, // 🔑 отправка и приём cookie
// });

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => token ? prom.resolve(token) : prom.reject(error));
  failedQueue = [];
};

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.post('/auth/refresh');
          const newToken = response.data.access_token;
          localStorage.setItem('access_token', newToken);
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError, null);
          window.location.href = '/login';
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(err);
  }
);

export default api;
export const loginUser = async (data: { email: string; password: string }) => {
  const form = new FormData();
  form.append('username', data.email);
  form.append('password', data.password);
  const res = await api.post('/auth/login', form);
  localStorage.setItem('access_token', res.data.access_token);
  return res.data;
};
export const registerUser = async (data: { email: string; password: string }) => {
  const res = await api.post('/users/', data);
  return res.data;
};