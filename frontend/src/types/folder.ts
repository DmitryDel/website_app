// frontend/src/types/folder.ts
export interface FolderRead {
  id: number;
  name: string;
  is_public: boolean;
  created_at: string;
  owner_id: number;
  set_count: number;
}