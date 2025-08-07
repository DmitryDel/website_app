from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from app.schemas.folder import FolderRead, FolderCreate, FolderUpdate
from app.schemas.set import CardSetRead, CardSetCreate # <-- Импортируем схемы наборов
from app.schemas.card import CardRead, CardCreate, CardReorderRequest
from app.services import folder_service, set_service, card_service # <-- Импортируем сервис наборов
from app.db.models import User, Folder
from app.core.security import get_current_user, get_db

router = APIRouter()

@router.get("/", response_model=List[FolderRead])
async def read_folders(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
        skip: int = 0,
        limit: int = 20,
        search: str = Query(None, description="Search folders by name")):
    """Получает список папок для текущего пользователя."""
    return await folder_service.get_folders(db, user_id=current_user.id, skip=skip, limit=limit, search=search)

@router.post("/", response_model=FolderRead, status_code=status.HTTP_201_CREATED)
async def create_folder(
        folder: FolderCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)):
    """Создает новую папку для текущего пользователя."""
    return await folder_service.create_folder(db=db, folder=folder, user_id=current_user.id)

@router.put("/{folder_id}", response_model=FolderRead, summary="Обновление папки", description="Обновляет папку по ID")
async def update_single_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновляет папку по ID, если она существует и принадлежит текущему пользователю."""

    # Получаем папку напрямую из БД (без использования update_folder)
    folder = await db.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    if folder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this folder")

    # Обновляем через сервис, не меняя сигнатуру метода
    updated_folder = await folder_service.update_folder(
        db, folder_id=folder_id, folder_update=folder_update, user_id=current_user.id
    )

    return updated_folder

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Удаление папки", description="Удаляет папку с указанным ID, текущего пользователя")
async def delete_folder(
        folder_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)):
    # Получение попки из БД
    folder = await folder_service.get_folder_by_id(db, folder_id)
    # Если не найдена
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Folder with ID {folder_id} not found")
    # Проверка владельца
    if folder.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this folder")
    # Удаляем папку
    await folder_service.delete_folder_by_id(db, folder_id)
    # Возвращаем 204 No Content — успешное удаление, контент не требуется
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- ЭНДПОИНТЫ ДЛЯ НАБОРОВ ВНУТРИ ПАПОК ---

@router.get("/{folder_id}/sets", response_model=List[CardSetRead])
async def read_sets_in_folder(
    folder_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None, description="Search sets by name"),
    tags: Optional[List[str]] = Query(None, description="Filter sets by tags")
):
    """Получает список наборов в конкретной папке."""
    sets = await set_service.get_sets_by_folder(db, folder_id=folder_id, user_id=current_user.id, skip=skip, limit=limit, search=search, tags=tags or [])
    if sets is None:
        raise HTTPException(status_code=404, detail="Folder not found or access denied")
    return sets

@router.post("/{folder_id}/sets", response_model=CardSetRead, status_code=status.HTTP_201_CREATED)
async def create_new_set_in_folder(
    folder_id: int,
    card_set: CardSetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Создает новый набор в конкретной папке."""
    created_set = await set_service.create_set_in_folder(
        db=db,
        card_set=card_set,
        folder_id=folder_id,
        user_id=current_user.id
    )
    if created_set is None:
        raise HTTPException(status_code=404, detail="Folder not found or you are not the owner")
    return created_set


# --- НОВЫЕ ЭНДПОИНТЫ ДЛЯ КАРТОЧЕК ---
# @router.post("/{folder_id}/sets/{set_id}/cards", response_model=CardRead, status_code=status.HTTP_201_CREATED)
# async def create_new_card(
#         set_id: int,
#         card_data: CardCreate,
#         db: AsyncSession = Depends(get_db),
#         current_user: User = Depends(get_current_user),
# ):
#     """Создает новую карточку в наборе."""
#     card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
#     if not card_set or card_set.owner_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not authorized to add cards to this set")
#     return await card_service.create_card(db, card_data=card_data, set_id=set_id)
#
#
# @router.post("/{folder_id}/sets/{set_id}/reorder", status_code=status.HTTP_204_NO_CONTENT)
# async def reorder_cards(
#         set_id: int,
#         reorder_request: CardReorderRequest,
#         db: AsyncSession = Depends(get_db),
#         current_user: User = Depends(get_current_user),
# ):
#     """Изменяет порядок карточек в наборе."""
#     card_set = await set_service.get_set_by_id(db, set_id=set_id, user_id=current_user.id)
#     if not card_set or card_set.owner_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not authorized to reorder cards in this set")
#
#     await card_service.update_card_order(db, set_id=set_id, card_ids=reorder_request.card_ids)
#     return {"ok": True}