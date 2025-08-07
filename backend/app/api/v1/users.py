from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter()

# Зависимость для получения сессии БД
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_new_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    API endpoint для создания нового пользователя.
    """
    # Проверяем, не существует ли уже пользователь с таким email
    db_user = await user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    # Если нет - создаем нового
    return await user_service.create_user(db=db, user=user)