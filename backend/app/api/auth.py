"""
Endpoints de autenticacion.

Maneja registro de usuario, login y generacion de token.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import UserService


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario.
    
    Args:
        user_data: Datos de registro del usuario
        db: Sesion de base de datos
        
    Returns:
        Informacion del usuario creado
        
    Raises:
        HTTPException: Si username o email ya existe
    """
    try:
        user = UserService.create_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Inicia sesion y genera token JWT.
    
    Args:
        credentials: Credenciales de inicio de sesion
        db: Sesion de base de datos
        
    Returns:
        Token de acceso JWT
        
    Raises:
        HTTPException: Si las credenciales son invalidas
    """
    user = UserService.authenticate_user(
        db,
        credentials.email,
        credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token}


async def get_bearer_token(authorization: str = Header(None)) -> str:
    """
    Extrae el bearer token del header Authorization.
    
    Args:
        authorization: Valor del header Authorization
        
    Returns:
        Token en formato string
        
    Raises:
        HTTPException: Si falta el header Authorization o es invalido
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, credentials = authorization.split() if " " in authorization else (None, None)
    
    if scheme != "Bearer" or not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials


@router.get("/me", response_model=UserResponse)
def get_current_user(
    token: str = Depends(get_bearer_token),
    db: Session = Depends(get_db)
):
    """
    Obtiene la informacion del usuario autenticado actual.
    
    Args:
        token: Token JWT desde el header Authorization
        db: Sesion de base de datos
        
    Returns:
        Informacion del usuario actual
        
    Raises:
        HTTPException: Si el token es invalido o expiro
    """
    from app.core.security import decode_token
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = UserService.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
