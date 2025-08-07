from pydantic import BaseModel, constr
from datetime import datetime
from typing import List, Optional
from app.schemas.tag import TagRead

class CardSetBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class CardSetCreate(CardSetBase):
    description: Optional[str] = ""
    is_public: bool = False
    tags: List[constr(strip_whitespace=True, to_lower=True)] = [] # Принимаем теги как список строк

class CardSetUpdate(CardSetBase):
    tags: List[constr(strip_whitespace=True, to_lower=True)] = []

class CardSetRead(CardSetBase):
    id: int
    created_at: datetime
    owner_id: int
    folder_id: int
    tags: List[TagRead] = [] # Отдаем теги как список объектов
    card_count: int

    class Config:
        from_attributes = True