from pydantic import BaseModel, constr
from typing import Optional

# Лимиты символов для полей карточки
TERM_MAX_LENGTH = 255
DEFINITION_MAX_LENGTH = 1000
EXAMPLE_MAX_LENGTH = 1000
TRANSLATION_MAX_LENGTH = 1000

class CardBase(BaseModel):
    term: constr(max_length=TERM_MAX_LENGTH)
    definition: constr(max_length=DEFINITION_MAX_LENGTH)
    example: Optional[constr(max_length=EXAMPLE_MAX_LENGTH)] = None
    translation: Optional[constr(max_length=TRANSLATION_MAX_LENGTH)] = None

class CardCreate(CardBase):
    pass

class CardUpdate(CardBase):
    pass

class CardRead(CardBase):
    id: int
    order: int
    set_id: int

    class Config:
        from_attributes = True

# Схема для операции пересортировки
class CardReorderRequest(BaseModel):
    card_ids: list[int]