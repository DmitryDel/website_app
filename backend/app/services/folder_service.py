from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_

from app.db.models import Folder, CardSet
from app.schemas.folder import FolderCreate, FolderUpdate, FolderRead
from fastapi import HTTPException, status

async def get_folders(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 20, search: str = ""):
    """Получает список папок с пагинацией, поиском и подсчетом наборов."""

    # Подзапрос для подсчета наборов в каждой папке
    set_count_subq = (
        select(CardSet.folder_id, func.count(CardSet.id).label("set_count"))
        .group_by(CardSet.folder_id)
        .subquery()
    )

    # Основной запрос на получение папок
    query = (
        select(Folder, func.coalesce(set_count_subq.c.set_count, 0).label("set_count"))
        .outerjoin(set_count_subq, Folder.id == set_count_subq.c.folder_id)
        .where(
            # Условие доступа: папка принадлежит пользователю ИЛИ она публичная
            or_(Folder.owner_id == user_id, Folder.is_public == True)
        )
    )

    # Если есть поисковый запрос, добавляем фильтр по имени
    if search:
        query = query.where(Folder.name.ilike(f"%{search}%"))

    # Сортировка, пагинация и выполнение запроса
    result = await db.execute(query.order_by(Folder.created_at.desc()).offset(skip).limit(limit))

    # Преобразуем результат в нужный формат
    folders_with_counts = []
    for folder, count in result.all():
        folder.set_count = count  # Добавляем вычисленное поле
        folders_with_counts.append(folder)

    return folders_with_counts


async def get_folder_by_id(
        db: AsyncSession,
        folder_id: int
) -> Folder | None:
    """
    Получает папку по ID.
    :param db: Асинхронная сессия SQLAlchemy
    :param folder_id: ID папки
    :return: FolderRead or None
    """
    result = await db.execute(select(Folder).where(Folder.id == folder_id))
    folder = result.scalars().one_or_none()
    return folder


async def delete_folder_by_id(
        db: AsyncSession,
        folder_id: int,
) -> bool:
    """
    Удаляем папку по ID
    :param db: Асинхронная сессия SQLAlchemy
    :param folder_id: ID удаляемой папки
    :return: True, если папка удалена, False, если не найдена
    """
    # Получаем объект папки по ID
    stmt = select(Folder).where(Folder.id == folder_id)
    result = await db.execute(stmt)
    folder = result.scalars().one_or_none()

    if not folder:
        return False
    # Удаляем экземпляр
    await db.delete(folder)
    # Флашим изменения и коммитим транзакцию
    await db.flush()
    await db.commit()
    return True


async def create_folder(db: AsyncSession, folder: FolderCreate, user_id: int):
    """Создает новую папку."""
    db_folder = Folder(**folder.dict(), owner_id=user_id)
    db.add(db_folder)
    await db.commit()
    await db.refresh(db_folder)
    # После создания у папки еще нет наборов
    db_folder.set_count = 0
    return db_folder


async def update_folder(db: AsyncSession, folder_id: int, folder_update: FolderUpdate, user_id: int):
    """Обновляет папку."""
    folder = await db.get(Folder, folder_id)
    # Проверяем, что папка существует и принадлежит пользователю
    if not folder or folder.owner_id != user_id:
        return None

    update_data = folder_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(folder, key, value)

    await db.commit()
    await db.refresh(folder)

    # После обновления нам нужно заново посчитать количество наборов
    count_result = await db.execute(select(func.count(CardSet.id)).where(CardSet.folder_id == folder_id))
    folder.set_count = count_result.scalar() or 0

    return folder


async def delete_folder(db: AsyncSession, folder_id: int, user_id: int):
    """Удаляет папку."""
    folder = await db.get(Folder, folder_id)
    if not folder or folder.owner_id != user_id:
        return False  # Папка не найдена или нет прав

    # Проверка на пустоту папки на бэкенде
    count_result = await db.execute(select(func.count(CardSet.id)).where(CardSet.folder_id == folder_id))
    if (count_result.scalar() or 0) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a folder that contains card sets.",
        )

    await db.delete(folder)
    await db.commit()
    return True