import api from './api';
import type {CardRead} from '../types/card'; // Мы создадим этот тип
// Мы создадим этот тип

// --- Типы ---
interface GetCardsParams { skip?: number; limit?: number; }
interface CardPayload {
  term: string;
  definition: string;
  example?: string | null;
  translation?: string | null;
}
interface ReorderPayload { card_ids: number[]; }

// --- Функции API ---
export const getCardsBySet = async (setId: number, params: GetCardsParams): Promise<CardRead[]> => {
  const response = await api.get(`/folders/0/sets/${setId}/cards`, { params }); // folder_id is not used in this endpoint, but path needs it
  return response.data;
};

export const createCard = async (setId: number, payload: CardPayload): Promise<CardRead> => {
  const response = await api.post(`/folders/0/sets/${setId}/cards`, payload);
  return response.data;
};

export const updateCard = async (cardId: number, payload: CardPayload): Promise<CardRead> => {
  const response = await api.put(`/cards/${cardId}`, payload);
  return response.data;
};

export const deleteCard = async (cardId: number): Promise<void> => {
  await api.delete(`/cards/${cardId}`);
};

export const reorderCards = async (setId: number, payload: ReorderPayload): Promise<void> => {
  await api.post(`/folders/0/sets/${setId}/reorder`, payload);
};

export const deleteAllCards = async (setId: number): Promise<void> => {
  await api.delete(`/sets/${setId}/cards`);
};