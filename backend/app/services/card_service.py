from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, delete
from typing import List
from app.db.models import Card, CardSet
from app.schemas.card import CardCreate, CardUpdate


async def get_cards_by_set(db: AsyncSession, set_id: int, skip: int, limit: int) -> List[Card]:
    """Получает список карточек для набора с пагинацией."""
    query = select(Card).where(Card.set_id == set_id).order_by(Card.order).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def create_card(db: AsyncSession, card_data: CardCreate, set_id: int) -> Card:
    """Создает новую карточку в наборе."""
    max_order_query = select(func.max(Card.order)).where(Card.set_id == set_id)
    max_order_result = await db.execute(max_order_query)
    max_order = max_order_result.scalar() or 0

    new_card = Card(**card_data.dict(), set_id=set_id, order=max_order + 1)
    db.add(new_card)
    await db.commit()
    await db.refresh(new_card)
    return new_card


async def update_card(db: AsyncSession, card_id: int, card_data: CardUpdate) -> Card:
    """Обновляет данные одной карточки."""
    card = await db.get(Card, card_id)
    if card:
        update_data = card_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(card, key, value)
        await db.commit()
        await db.refresh(card)
    return card


async def delete_card(db: AsyncSession, card_id: int) -> bool:
    """Удаляет одну карточку."""
    card = await db.get(Card, card_id)
    if card:
        await db.delete(card)
        await db.commit()
        return True
    return False


async def update_card_order(db: AsyncSession, set_id: int, card_ids: List[int]):
    """Обновляет порядок карточек в наборе."""
    cards_query = select(Card).where(Card.set_id == set_id)
    result = await db.execute(cards_query)
    cards_map = {card.id: card for card in result.scalars().all()}

    for index, card_id in enumerate(card_ids):
        if card_id in cards_map:
            cards_map[card_id].order = index

    await db.commit()


async def delete_all_cards_in_set(db: AsyncSession, set_id: int):
    """Удаляет все карточки в наборе."""
    await db.execute(delete(Card).where(Card.set_id == set_id))
    await db.commit()