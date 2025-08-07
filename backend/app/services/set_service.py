from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from typing import List
from app.db.models import CardSet, Folder, Tag, User, Card
from app.schemas.set import CardSetCreate, CardSetUpdate
from app.services import tag_service

async def get_sets_by_folder(
        db: AsyncSession, folder_id: int, user_id: int, skip: int = 0, limit: int = 20, search: str = "",
        tags: List[str] = []
):
    """Получает список наборов в конкретной папке с пагинацией и поиском."""

    folder = await db.get(Folder, folder_id)
    if not folder or (not folder.is_public and folder.owner_id != user_id):
        return None

    # 1. Основной запрос теперь выбирает и сам объект CardSet, и количество Card
    query = (
        select(CardSet, func.count(Card.id).label("card_count"))
        .outerjoin(Card, CardSet.id == Card.set_id)  # Используем outerjoin на случай, если в наборе 0 карточек
        .where(CardSet.folder_id == folder_id)
        .group_by(CardSet.id)  # Группируем по ID набора для корректного подсчета
        .options(selectinload(CardSet.tags))  # Жадно загружаем теги, как и раньше
    )

    # 2. Применяем фильтры
    if search:
        query = query.where(CardSet.name.ilike(f"%{search}%"))

    if tags:
        query = query.join(CardSet.tags).where(Tag.name.in_(tags))

    # 3. Выполняем запрос с сортировкой и пагинацией
    result = await db.execute(
        query.order_by(CardSet.created_at.desc()).offset(skip).limit(limit)
    )

    # 4. Обрабатываем результат, который теперь является кортежем (CardSet, count)
    sets_with_counts = []
    for card_set, count in result.all():
        card_set.card_count = count  # Присваиваем вычисленное значение
        sets_with_counts.append(card_set)

    return sets_with_counts

async def create_set_in_folder(db: AsyncSession, card_set: CardSetCreate, folder_id: int, user_id: int):
    """Создает новый набор карточек в указанной папке."""
    from app.services.tag_service import get_or_create_tags

    # Проверяем, существует ли папка и принадлежит ли она пользователю
    folder = await db.get(Folder, folder_id)
    if not folder or folder.owner_id != user_id:
        return None  # Нельзя создать набор в чужой или несуществующей папке

    # Получаем или создаем теги
    tags_obj_list = await get_or_create_tags(db, card_set.tags)

    # Создаем объект набора, исключая поле 'tags' из схемы Pydantic
    db_card_set = CardSet(
        **card_set.dict(exclude={"tags"}),
        owner_id=user_id,
        folder_id=folder_id,
        tags=tags_obj_list  # Присваиваем готовые объекты тегов
    )

    db.add(db_card_set)
    await db.commit()
    await db.refresh(db_card_set)

    # Присваиваем 0, так как новый набор всегда пуст
    db_card_set.card_count = 0

    # Мы все еще должны жадно загрузить теги для корректного ответа
    query = select(CardSet).where(CardSet.id == db_card_set.id).options(selectinload(CardSet.tags))
    result = await db.execute(query)
    created_set_with_tags = result.scalars().one()
    created_set_with_tags.card_count = 0  # Убеждаемся, что поле есть в финальном объекте

    return created_set_with_tags


async def get_set_by_id(db: AsyncSession, set_id: int, user_id: int):
    """Получает один набор по ID, проверяя права доступа и подсчитывая карточки."""

    # 1. Скалярный подзапрос для подсчета карточек. Он эффективен и не требует JOIN в основном запросе.
    card_count_subq = (
        select(func.count(Card.id))
        .where(Card.set_id == set_id)
        .scalar_subquery()  # Используем scalar_subquery для простоты
    )

    # 2. Основной запрос теперь намного чище.
    # Мы убрали ненужные outerjoin() и group_by(), которые вызывали конфликт.
    query = (
        select(CardSet, card_count_subq.label("card_count"))
        .where(CardSet.id == set_id)
        .options(selectinload(CardSet.tags), joinedload(CardSet.owner))  # жадная загрузка остается
    )

    result = await db.execute(query)
    res = result.first()

    if not res:
        return None

    card_set, card_count = res
    card_set.card_count = card_count

    if card_set and (card_set.is_public or card_set.owner_id == user_id):
        return card_set
    return None


async def update_set(db: AsyncSession, set_id: int, set_update: CardSetUpdate, user_id: int):
    """Обновляет набор карточек."""
    # Эта функция теперь будет работать корректно, так как get_set_by_id исправлен
    db_set = await get_set_by_id(db, set_id, user_id)
    if not db_set or db_set.owner_id != user_id:
        return None

    update_data = set_update.dict(exclude_unset=True)

    if "tags" in update_data:
        tags_obj_list = await tag_service.get_or_create_tags(db, update_data["tags"])
        db_set.tags = tags_obj_list
        del update_data["tags"]

    for key, value in update_data.items():
        setattr(db_set, key, value)

    db.add(db_set)
    await db.commit()
    await db.refresh(db_set)

    # После обновления нам нужно вернуть объект со свежим подсчетом карточек
    return await get_set_by_id(db, set_id=db_set.id, user_id=user_id)

async def delete_set(db: AsyncSession, set_id: int, user_id: int):
    """Удаляет набор карточек."""
    db_set = await db.get(CardSet, set_id)
    # Убеждаемся, что пользователь является владельцем
    if not db_set or db_set.owner_id != user_id:
        return None

    await db.delete(db_set)
    await db.commit()
    return True