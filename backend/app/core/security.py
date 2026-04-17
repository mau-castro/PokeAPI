"""
Modulo de seguridad para gestion de JWT y hash de contrasenas.

Este modulo provee utilidades para:
- Creacion y verificacion de tokens JWT
- Hash y validacion de contrasenas
- Autenticacion y autorizacion de usuarios
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError

from app.core.config import settings


# Contexto para hash de contrasenas
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hashea una contrasena en texto plano usando Argon2.
    
    Args:
        password: Contrasena en texto plano a hashear
        
    Returns:
        Contrasena hasheada
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contrasena en texto plano contra una hasheada.
    
    Args:
        plain_password: Contrasena en texto plano a verificar
        hashed_password: Contrasena hasheada para comparar
        
    Returns:
        True si coinciden, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crea un token de acceso JWT.
    
    Args:
        data: Diccionario con claims a codificar
        expires_delta: Delta opcional de expiracion
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decodifica y verifica un token de acceso JWT.
    
    Args:
        token: Token JWT a decodificar
        
    Returns:
        Payload del token si es valido, None en caso contrario
        
    Raises:
        JWTError: Si el token es invalido
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except (JWTError, ValidationError):
        return None
