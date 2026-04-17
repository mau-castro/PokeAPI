"""
Endpoints de Pokemon.

Maneja busqueda y obtencion de datos desde PokéAPI.
"""

from fastapi import APIRouter, HTTPException, Query, status, Header
from typing import Optional

from app.services.pokemon_service import PokemonAPIService
from app.schemas import PokemonDetail


router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("/search/{pokemon_id_or_name}", response_model=PokemonDetail)
async def search_pokemon(
    pokemon_id_or_name: str,
    authorization: Optional[str] = Header(None)
):
    """
    Busca un Pokemon por ID o nombre.
    
    Args:
        pokemon_id_or_name: ID o nombre del Pokemon
        authorization: Header Authorization (para rate limiting futuro)
        
    Returns:
        Detalles del Pokemon
        
    Raises:
        HTTPException: Si el Pokemon no existe
    """
    pokemon_data = await PokemonAPIService.get_pokemon(pokemon_id_or_name)
    
    if not pokemon_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pokémon '{pokemon_id_or_name}' not found"
        )
    
    extracted_data = PokemonAPIService._extract_pokemon_data(pokemon_data)
    return extracted_data


@router.get("/list", response_model=dict)
async def list_pokemon(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    authorization: Optional[str] = Header(None)
):
    """
    Obtiene una lista paginada de Pokemon.
    
    Args:
        limit: Numero de Pokemon por pagina (1-100)
        offset: Offset de paginacion
        authorization: Header Authorization
        
    Returns:
        Lista paginada de Pokemon
    """
    result = await PokemonAPIService.search_pokemon(limit, offset)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch Pokémon list"
        )
    
    return {
        "count": result.get("count"),
        "next": result.get("next"),
        "previous": result.get("previous"),
        "results": result.get("results", [])
    }


@router.get("/species/{pokemon_id_or_name}")
async def get_pokemon_species(
    pokemon_id_or_name: str,
    authorization: Optional[str] = Header(None)
):
    """
    Obtiene informacion detallada de especie de un Pokemon.
    
    Args:
        pokemon_id_or_name: ID o nombre del Pokemon
        authorization: Header Authorization
        
    Returns:
        Datos de especie del Pokemon
        
    Raises:
        HTTPException: Si no se encuentra la especie del Pokemon
    """
    species_data = await PokemonAPIService.get_pokemon_species(pokemon_id_or_name)
    
    if not species_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species data for '{pokemon_id_or_name}' not found"
        )
    
    return {
        "name": species_data.get("name"),
        "generation": species_data.get("generation", {}).get("name"),
        "is_main_series": species_data.get("is_main_series"),
        "flavor_text": species_data.get("flavor_text_entries"),
    }
