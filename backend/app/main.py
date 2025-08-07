from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.database import engine
from app.api.v1 import users, auth, folders, sets, cards

app = FastAPI(title="English Flashcards API")

# --- НАСТРОЙКА CORS ---
origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://localhost:5173", # Адрес нашего Vite dev сервера
    # "http://localhost:5174",
    # Добавьте сюда адрес вашего развернутого фронтенда, когда он появится
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Разрешаем запросы от этих источников
    allow_credentials=True, # Разрешаем передачу cookie
    allow_methods=["*"], # Разрешаем все методы (GET, POST, etc.)
    allow_headers=["*"], # Разрешаем все заголовки
)

# Это асинхронная функция, которая создаст таблицы в БД при старте приложения
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Раскомментируйте, чтобы пересоздавать таблицы при каждом старте
        await conn.run_sync(Base.metadata.create_all)

# Подключаем роутеры
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(folders.router, prefix="/api/v1/folders", tags=["folders"])
app.include_router(sets.router, prefix="/api/v1/sets", tags=["sets"])
app.include_router(cards.router, prefix="/api/v1/cards", tags=["cards"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Flashcards API!"}