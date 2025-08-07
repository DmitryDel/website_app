from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.set import CardSetRead, CardSetUpdate
from app.schemas.card import CardRead, CardCreate, CardReorderRequest
from app.services import set_service, card_service
from app.db.models import User
from app.core.security import get_current_user, get_db

router = APIRouter()

@router.get("/{set_id}", response_model=CardSetRead)
async def read_set(set_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Получает один набор по ID."""
    db_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
    if db_set is None:
        raise HTTPException(status_code=404, detail="Card Set not found or access denied")
    return db_set

@router.put("/{set_id}", response_model=CardSetRead)
async def update_set(set_id: int, set_update: CardSetUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Обновляет набор по ID."""
    updated_set = await set_service.update_set(db, set_id=set_id, set_update=set_update, user_id=current_user.id)
    if updated_set is None:
        raise HTTPException(status_code=404, detail="Card Set not found or you are not the owner")
    return updated_set

@router.delete("/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_set(set_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Удаляет набор по ID."""
    success = await set_service.delete_set(db, set_id=set_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Card Set not found or you are not the owner")
    return {"ok": True}

@router.delete("/{set_id}/cards", status_code=status.HTTP_204_NO_CONTENT)
async def clear_all_cards_in_set(
        set_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Удаляет все карточки внутри набора."""
    card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
    if not card_set or card_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to clear this set")

    await card_service.delete_all_cards_in_set(db, set_id=set_id)
    return {"ok": True}

@router.get("/{set_id}/cards", response_model=List[CardRead])
async def read_cards_in_set(
        set_id: int,
        skip: int = 0,
        limit: int = 100,  # По умолчанию загружаем до 100 карточек, как мы и обсуждали
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Получает список карточек для указанного набора."""
    # Сначала проверяем, имеет ли пользователь доступ к самому набору
    card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
    if not card_set:
        raise HTTPException(status_code=404, detail="Card Set not found or access denied")

    # Если доступ есть, получаем карточки
    cards = await card_service.get_cards_by_set(db, set_id=set_id, skip=skip, limit=limit)
    return cards


@router.post("/{set_id}/cards", response_model=CardRead, status_code=status.HTTP_201_CREATED)
async def create_new_card(
        set_id: int,
        card_data: CardCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Создает новую карточку в наборе."""
    card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
    if not card_set or card_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add cards to this set")
    return await card_service.create_card(db, card_data=card_data, set_id=set_id)


@router.post("/{set_id}/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_cards(
        set_id: int,
        reorder_request: CardReorderRequest,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Изменяет порядок карточек в наборе."""
    card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
    if not card_set or card_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reorder cards in this set")

    await card_service.update_card_order(db, set_id=set_id, card_ids=reorder_request.card_ids)
    return {"ok": True}