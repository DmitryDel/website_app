from pydantic import BaseModel
from datetime import datetime

class FolderBase(BaseModel):
    name: str
    is_public: bool = False

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    pass

class FolderRead(FolderBase):
    id: int
    created_at: datetime
    owner_id: int
    set_count: int # Наше вычисляемое поле

    class Config:
        from_attributes = True