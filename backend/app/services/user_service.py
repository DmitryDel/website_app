from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

async def get_user_by_email(db: AsyncSession, email: str):
    """Находит пользователя по email."""
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate):
    """Создает нового пользователя."""
    # Хешируем пароль перед сохранением
    hashed_pass = hash_password(user.password)
    # Создаем объект модели SQLAlchemy
    db_user = User(email=user.email, hashed_password=hashed_pass)
    # Добавляем в сессию и сохраняем в БД
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user