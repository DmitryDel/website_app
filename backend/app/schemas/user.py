from pydantic import BaseModel, EmailStr
from datetime import datetime

# Схема для создания пользователя (что мы принимаем от клиента)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Схема для чтения пользователя (что мы отдаем клиенту)
# Важно: никогда не отдаем пароль!
class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True # Позволяет Pydantic работать с моделями SQLAlchemy