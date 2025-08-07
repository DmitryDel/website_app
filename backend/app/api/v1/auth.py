# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.db.database import AsyncSessionLocal
# from app.schemas.token import Token
# from app.services import user_service
# from app.core.security import verify_password, create_access_token
#
# router = APIRouter()
#
#
# async def get_db():
#     async with AsyncSessionLocal() as session:
#         yield session
#
#
# # Этот endpoint будет принимать form-data (логин и пароль)
# # и возвращать JWT токен
# @router.post("/login", response_model=Token)
# async def login_for_access_token(
#         form_data: OAuth2PasswordRequestForm = Depends(),
#         db: AsyncSession = Depends(get_db)
# ):
#     # 1. Ищем пользователя по email (в OAuth2 email находится в поле username)
#     user = await user_service.get_user_by_email(db, email=form_data.username)
#
#     # 2. Если пользователь не найден или пароль неверный - кидаем ошибку
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#
#     # 3. Если все верно - создаем access token
#     # В "sub" (subject) обычно кладут идентификатор пользователя
#     access_token_data = {"sub": user.email}
#     access_token = create_access_token(data=access_token_data)
#
#     return {"access_token": access_token, "token_type": "bearer"}

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import AsyncSessionLocal
from app.schemas.token import Token
from app.services import user_service
from app.core.security import verify_password, create_access_token, create_refresh_token
from datetime import timedelta

router = APIRouter()
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/login", response_model=Token)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await user_service.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    # Сохраняем refresh_token в HTTP-only cookie:
    max_age = 60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=False,               # в продакшн включите True
        samesite="lax",
        max_age=max_age,
        path="/api/v1/auth/refresh"
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(response: Response, db: AsyncSession = Depends(get_db)):
    from fastapi import Cookie
    from jose import JWTError, jwt
    from app.core.security import settings

    token = response.request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing refresh token")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise JWTError()
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    user = await user_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    new_access = create_access_token({"sub": email})
    new_refresh = create_refresh_token({"sub": email})
    # Обновляем cookie
    response.set_cookie(
        "refresh_token",
        new_refresh,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=max_age,
        path="/api/v1/auth/refresh"
    )
    return {"access_token": new_access, "token_type": "bearer"}