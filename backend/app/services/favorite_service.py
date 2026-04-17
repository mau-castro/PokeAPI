"""
Favorite Pokémon management service.

Handles operations related to user's favorite Pokémon collection.
"""

from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import PokemonFavorite
from app.schemas import PokemonFavoriteResponse


class FavoriteService:
    """Service for managing favorite Pokémon."""
    
    @staticmethod
    def add_favorite(
        db: Session,
        user_id: int,
        pokemon_id: int,
        pokemon_name: str
    ) -> PokemonFavorite:
        """
        Add a Pokémon to user's favorites.
        
        Args:
            db: Database session
            user_id: User ID
            pokemon_id: PokéAPI Pokémon ID
            pokemon_name: Pokémon name
            
        Returns:
            Created PokemonFavorite instance
        """
        favorite = PokemonFavorite(
            user_id=user_id,
            pokemon_id=pokemon_id,
            pokemon_name=pokemon_name
        )
        
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        
        return favorite
    
    @staticmethod
    def remove_favorite(
        db: Session,
        user_id: int,
        pokemon_id: int
    ) -> bool:
        """
        Remove a Pokémon from user's favorites.
        
        Args:
            db: Database session
            user_id: User ID
            pokemon_id: PokéAPI Pokémon ID
            
        Returns:
            True if deleted, False if not found
        """
        favorite = db.query(PokemonFavorite).filter(
            PokemonFavorite.user_id == user_id,
            PokemonFavorite.pokemon_id == pokemon_id
        ).first()
        
        if favorite:
            db.delete(favorite)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def get_user_favorites(
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[PokemonFavorite]:
        """
        Obtiene los Pokemon favoritos del usuario con paginacion.
        
        Args:
            db: Sesion de base de datos
            user_id: ID del usuario
            limit: Numero maximo de resultados
            offset: Offset de paginacion
            
        Returns:
            Lista de instancias PokemonFavorite
        """
        return db.query(PokemonFavorite).filter(
            PokemonFavorite.user_id == user_id
        ).offset(offset).limit(limit).all()
    
    @staticmethod
    def is_favorite(
        db: Session,
        user_id: int,
        pokemon_id: int
    ) -> bool:
        """
        Verifica si un Pokemon esta en favoritos del usuario.
        
        Args:
            db: Sesion de base de datos
            user_id: ID del usuario
            pokemon_id: ID de Pokemon en PokéAPI
            
        Returns:
            True si el Pokemon es favorito, False en caso contrario
        """
        favorite = db.query(PokemonFavorite).filter(
            PokemonFavorite.user_id == user_id,
            PokemonFavorite.pokemon_id == pokemon_id
        ).first()
        
        return favorite is not None
    
    @staticmethod
    def get_favorites_count(db: Session, user_id: int) -> int:
        """
        Obtiene el conteo total de favoritos del usuario.
        
        Args:
            db: Sesion de base de datos
            user_id: ID del usuario
            
        Returns:
            Conteo de Pokemon favoritos
        """
        return db.query(PokemonFavorite).filter(
            PokemonFavorite.user_id == user_id
        ).count()
