"""
Servicio de autenticacion y gestion de usuarios.

Implementa la logica de negocio para registro, login y gestion de cuentas.
Sigue el patron Service Layer para separar responsabilidades.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from app.models import User
from app.core.security import hash_password, verify_password
from app.schemas import UserCreate, UserResponse


class UserService:
    """Clase de servicio para operaciones relacionadas a usuarios."""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Crea un nuevo usuario en la base de datos.
        
        Args:
            db: Sesion de base de datos
            user_data: Datos de creacion de usuario
            
        Returns:
            Instancia User creada
            
        Raises:
            IntegrityError: Si username o email ya existe
        """
        hashed_password = hash_password(user_data.password)
        
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError:
            db.rollback()
            raise ValueError("Username or email already exists")
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Obtiene un usuario por email.
        
        Args:
            db: Sesion de base de datos
            email: Email del usuario
            
        Returns:
            Instancia User si existe, None en caso contrario
        """
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Obtiene un usuario por ID.
        
        Args:
            db: Sesion de base de datos
            user_id: ID del usuario
            
        Returns:
            Instancia User si existe, None en caso contrario
        """
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Autentica usuario con email y contrasena.
        
        Args:
            db: Sesion de base de datos
            email: Email del usuario
            password: Contrasena del usuario
            
        Returns:
            Instancia User si la autenticacion es correcta, None en caso contrario
        """
        user = UserService.get_user_by_email(db, email)
        
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        return user
