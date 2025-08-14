import api from './api'; // <-- Импортируем наш центральный экземпляр
import { type CardSetRead } from '../types/set';
import { type SetPayload } from "../types/api.ts";

// --- Типы для параметров ---
interface GetSetsParams {
    skip?: number; // Пропустить определённое количество записей (для пагинации)
    limit?: number; // Ограничить количество возвращаемых записей
    search?: string; // Поиск по названию или содержимому
    tags?: string[]; // Фильтрация по тегам
}

// --- Функции API ---

export const getSetById = async (setId: number): Promise<CardSetRead> => {
  const response = await api.get(`/sets/${setId}`);
  return response.data;
};

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