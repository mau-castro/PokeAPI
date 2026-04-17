"""
Endpoints de favoritos.

Maneja la coleccion de Pokemon favoritos del usuario.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.auth import get_current_user
from app.core.database import get_db
from app.schemas import PokemonFavoriteCreate, PokemonFavoriteResponse
from app.services.favorite_service import FavoriteService


router = APIRouter(prefix="/favorites", tags=["favorites"])


def get_current_user_id(current_user=Depends(get_current_user)):
    """
    Dependencia para extraer y validar el ID de usuario desde JWT.
    
    Args:
        authorization: Header Authorization
        db: Sesion de base de datos
        
    Returns:
        ID de usuario
        
    Raises:
        HTTPException: Si el token es invalido o el usuario no existe
    """
    return int(current_user.id)


@router.post("/add", response_model=PokemonFavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    favorite_data: PokemonFavoriteCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Agrega un Pokemon a favoritos del usuario.
    
    Args:
        favorite_data: ID y nombre del Pokemon
        user_id: ID del usuario actual
        db: Sesion de base de datos
        
    Returns:
        Registro de favorito creado
    """
    if FavoriteService.is_favorite(db, user_id, favorite_data.pokemon_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pokémon already in favorites"
        )
    
    favorite = FavoriteService.add_favorite(
        db,
        user_id,
        favorite_data.pokemon_id,
        favorite_data.pokemon_name
    )
    
    return favorite


@router.delete("/remove/{pokemon_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    pokemon_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Elimina un Pokemon de favoritos del usuario.
    
    Args:
        pokemon_id: ID del Pokemon
        user_id: ID del usuario actual
        db: Sesion de base de datos
        
    Raises:
        HTTPException: Si el Pokemon no esta en favoritos
    """
    if not FavoriteService.remove_favorite(db, user_id, pokemon_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pokémon not in favorites"
        )


@router.get("/list", response_model=List[PokemonFavoriteResponse])
def get_favorites(
    limit: int = 50,
    offset: int = 0,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Obtiene la lista de Pokemon favoritos del usuario con paginacion.
    
    Args:
        limit: Numero maximo de resultados
        offset: Offset de paginacion
        user_id: ID del usuario actual
        db: Sesion de base de datos
        
    Returns:
        Lista de Pokemon favoritos
    """
    favorites = FavoriteService.get_user_favorites(db, user_id, limit, offset)
    return favorites


@router.get("/count", response_model=dict)
def get_favorites_count(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Obtiene el conteo total de Pokemon favoritos del usuario.
    
    Args:
        user_id: ID del usuario actual
        db: Sesion de base de datos
        
    Returns:
        Cantidad de favoritos
    """
    count = FavoriteService.get_favorites_count(db, user_id)
    return {"count": count}


@router.get("/check/{pokemon_id}", response_model=dict)
def check_favorite(
    pokemon_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Verifica si un Pokemon esta en favoritos del usuario.
    
    Args:
        pokemon_id: ID del Pokemon
        user_id: ID del usuario actual
        db: Sesion de base de datos
        
    Returns:
        Indica si el Pokemon es favorito
    """
    is_favorite = FavoriteService.is_favorite(db, user_id, pokemon_id)
    return {"is_favorite": is_favorite}
