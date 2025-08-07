// import axios from 'axios';
import api from './api'; // <-- Импортируем наш центральный экземпляр
import { type CardSetRead } from '../types/set';

// const API_URL = 'http://localhost:8000/api/v1';
// const api = axios.create({ baseURL: API_URL });
//
// // Тот же самый перехватчик для консистентности
// api.interceptors.request.use(config => {
//   const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
//   const token = authStorage?.state?.token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// --- Типы для параметров ---
interface GetSetsParams {
    skip?: number; // Пропустить определённое количество записей (для пагинации)
    limit?: number; // Ограничить количество возвращаемых записей
    search?: string; // Поиск по названию или содержимому
    tags?: string[]; // Фильтрация по тегам
}

interface SetPayload { name: string; description?: string | null; is_public: boolean; tags: string[]; }

// --- Функции API ---
export const getSetsByFolder = async (folderId: number, params: GetSetsParams): Promise<CardSetRead[]> => {
  const response = await api.get(`/folders/${folderId}/sets`, { params });
  return response.data;
};

export const createSet = async (folderId: number, payload: SetPayload): Promise<CardSetRead> => {
  const response = await api.post(`/folders/${folderId}/sets`, payload);
  return response.data;
};

export const updateSet = async (id: number, payload: SetPayload): Promise<CardSetRead> => {
    const response = await api.put(`/sets/${id}`, payload);
    return response.data;
};

export const deleteSet = async (id: number): Promise<void> => {
  await api.delete(`/sets/${id}`);
};