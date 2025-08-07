// Определяем типы для наших данных для строгости TypeScript
export interface Folder {
  id: number;
  name: string;
  createdAt: string;
}

export interface CardSet {
  id: number;
  name:string;
  folderId: number; // Каждый набор принадлежит папке
  createdAt: string;
  cardCount: number;
}

// Создаем массивы с данными-заглушками
export const mockFolders: Folder[] = [
  { id: 1, name: 'Work & IT', createdAt: new Date('2025-06-27T10:00:00Z').toISOString() },
  { id: 2, name: 'Travel & Hobbies', createdAt: new Date('2025-06-26T15:30:00Z').toISOString() },
  { id: 3, name: 'Daily Life', createdAt: new Date('2025-06-25T11:00:00Z').toISOString() },
];

export const mockCardSets: CardSet[] = [
  { id: 101, name: 'Common English Idioms', folderId: 3, createdAt: new Date().toISOString(), cardCount: 25 },
  { id: 102, name: 'Job Interview Questions', folderId: 1, createdAt: new Date('2025-06-27T11:00:00Z').toISOString(), cardCount: 40 },
  { id: 103, name: 'At the Airport', folderId: 2, createdAt: new Date('2025-06-26T16:00:00Z').toISOString(), cardCount: 30 },
  { id: 104, name: 'Emailing Vocabulary', folderId: 1, createdAt: new Date('2025-06-27T09:00:00Z').toISOString(), cardCount: 50 },
];