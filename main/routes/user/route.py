from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
from database import get_db
from . import crud, schemas  # Import from the same directory
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from database import SessionLocal
# JWT конфигурация
SECRET_KEY = "sosal"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


router = APIRouter(
    prefix="/users",
    tags=["users"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# Верификация токена
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not contain email",
            )
        expiration = payload.get("exp")
        if expiration < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

# Утилита для создания JWT токена
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.get("/verify-token")
def verify_route(
    email: Annotated[str, Depends(verify_token)],
    db: Annotated[Session, Depends(get_db)]
):
    user = crud.get_user_by_email(db=SessionLocal(), email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return user

# Эндпоинт для логина
@router.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Проверяем email
    user = crud.get_user_by_email(db, email=login_data.email)
    if not user or user.password != login_data.password:  # Пароль без хэширования
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный email или пароль"
        )

    # Создаём JWT токен
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_user(
        db=db,
        username=user.username,
        email=user.email,
        password=user.password  # Note: In production, hash the password before storing
    )

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.patch("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    updated_user = crud.update_user(
        db=db,
        user_id=user_id,
        username=user_update.username,
        email=user_update.email,
        bio=user_update.bio
    )
    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return None