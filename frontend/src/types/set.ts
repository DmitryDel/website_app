// frontend/src/types/set.ts
import { type TagRead } from './tag';

export interface CardSetRead {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  owner_id: number;
  folder_id: number;
  tags: TagRead[];
}