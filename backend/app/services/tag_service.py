from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.models import Tag


async def get_or_create_tags(db: AsyncSession, tag_names: List[str]) -> List[Tag]:
    """
    Принимает список названий тегов.
    Находит существующие теги в БД и создает новые, если их нет.
    Возвращает список объектов модели Tag.
    """
    if not tag_names:
        return []

    # Находим теги, которые уже существуют в базе данных
    existing_tags_query = await db.execute(select(Tag).where(Tag.name.in_(tag_names)))
    existing_tags = existing_tags_query.scalars().all()
    existing_tag_names = {tag.name for tag in existing_tags}

    # Определяем, какие теги нужно создать
    new_tag_names = set(tag_names) - existing_tag_names
    new_tags = [Tag(name=name) for name in new_tag_names]

    # Если есть новые теги, добавляем их в сессию
    if new_tags:
        db.add_all(new_tags)
        await db.flush()  # Используем flush, чтобы получить id для новых тегов без полного коммита

    # Собираем итоговый список из существующих и только что созданных тегов
    all_tags = list(existing_tags) + new_tags
    return all_tags