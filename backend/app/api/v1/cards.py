from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.card import CardUpdate, CardRead, CardReorderRequest
from app.services import card_service, set_service
from app.db.models import User
from app.core.security import get_current_user, get_db

router = APIRouter()


@router.put("/{card_id}", response_model=CardRead)
async def update_card_details(
        card_id: int,
        card_data: CardUpdate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Обновляет текстовые поля карточки (для автосохранения)."""
    # Сначала получаем набор, чтобы проверить права владения
    card = await db.get(card_service.Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card_set = await set_service.get_set_by_id(db, set_id=card.set_id, user_id=current_user.id)
    if not card_set or card_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this card")

    return await card_service.update_card(db, card_id=card_id, card_data=card_data)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_single_card(
        card_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Удаляет одну карточку."""
    # Проверка прав владения аналогична той, что в update
    card = await db.get(card_service.Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card_set = await set_service.get_set_by_id(db, set_id=card.set_id, user_id=current_user.id)
    if not card_set or card_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this card")

    await card_service.delete_card(db, card_id=card_id)
    return {"ok": True}