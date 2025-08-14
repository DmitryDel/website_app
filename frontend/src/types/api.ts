// --- Payloads for Card operations ---
export interface CardPayload {
  term: string;
  definition: string;
  example?: string | null;
  translation?: string | null;
}

export interface ReorderPayload {
  card_ids: number[];
}

// --- Payloads for Set operations ---
export interface SetPayload {
  name: string;
  description: string;
  is_public: boolean;
  tags: string[];
}

// --- Parameter types for GET requests ---
export interface GetCardsParams {
  skip?: number;
  limit?: number;
}