from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

# Создаем асинхронный "движок" для подключения к БД
engine = create_async_engine(settings.DATABASE_URL)

# Создаем фабрику сессий для взаимодействия с БД
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)