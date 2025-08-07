// import axios from 'axios';
import api from './api'; // <-- Импортируем наш центральный экземпляр
import { type FolderRead } from '../types/folder';

// const API_URL = 'http://localhost:8000/api/v1';
// const api = axios.create({ baseURL: API_URL });

// Перехватчик запросов для автоматического добавления токена авторизации
// api.interceptors.request.use(config => {
//   // Получаем состояние из localStorage, где Zustand его сохраняет
//   const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
//   const token = authStorage?.state?.token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// --- Типы для параметров ---
interface GetFoldersParams { skip?: number; limit?: number; search?: string; }
interface FolderPayload { name: string; is_public: boolean; }

// --- Функции API ---
export const getFolders = async (params: GetFoldersParams): Promise<FolderRead[]> => {
  const response = await api.get('/folders/', { params });
  return response.data;
};

export const createFolder = async (payload: FolderPayload): Promise<FolderRead> => {
  const response = await api.post('/folders/', payload);
  return response.data;
};

export const updateFolder = async (id: number, payload: FolderPayload): Promise<FolderRead> => {
    const response = await api.put(`/folders/${id}`, payload);
    return response.data;
};

export const deleteFolder = async (id: number): Promise<void> => {
  await api.delete(`/folders/${id}`);
};