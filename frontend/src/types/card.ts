export interface CardRead {
  id: number;
  term: string;
  definition: string;
  example: string | null;
  translation: string | null;
  order: number;
  set_id: number;
}