"""
PokéAPI integration service.

Handles all interactions with the external PokéAPI,
including fetching Pokémon data and caching strategies.
"""

import httpx
from typing import Optional, Dict, Any
from app.core.config import settings


class PokemonAPIService:
    """Service for PokéAPI integration."""
    
    BASE_URL = settings.POKEAPI_BASE_URL
    TIMEOUT = 10
    
    @classmethod
    async def get_pokemon(cls, pokemon_id_or_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetch Pokémon data from PokéAPI.
        
        Args:
            pokemon_id_or_name: Pokémon ID or name
            
        Returns:
            Dictionary with Pokémon data or None if not found
        """
        try:
            async with httpx.AsyncClient(timeout=cls.TIMEOUT) as client:
                response = await client.get(
                    f"{cls.BASE_URL}/pokemon/{pokemon_id_or_name.lower()}"
                )
                
                if response.status_code == 200:
                    return response.json()
                
                return None
        except httpx.RequestError:
            return None
    
    @classmethod
    async def search_pokemon(
        cls,
        limit: int = 20,
        offset: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch paginated list of Pokémon.
        
        Args:
            limit: Number of Pokémon to fetch
            offset: Pagination offset
            
        Returns:
            Dictionary with list of Pokémon or None if error
        """
        try:
            async with httpx.AsyncClient(timeout=cls.TIMEOUT) as client:
                response = await client.get(
                    f"{cls.BASE_URL}/pokemon",
                    params={"limit": limit, "offset": offset}
                )
                
                if response.status_code == 200:
                    return response.json()
                
                return None
        except httpx.RequestError:
            return None
    
    @classmethod
    async def get_pokemon_species(
        cls,
        pokemon_id_or_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch Pokémon species data for additional information.
        
        Args:
            pokemon_id_or_name: Pokémon ID or name
            
        Returns:
            Dictionary with species data or None if not found
        """
        try:
            async with httpx.AsyncClient(timeout=cls.TIMEOUT) as client:
                response = await client.get(
                    f"{cls.BASE_URL}/pokemon-species/{pokemon_id_or_name.lower()}"
                )
                
                if response.status_code == 200:
                    return response.json()
                
                return None
        except httpx.RequestError:
            return None
    
    @staticmethod
    def _extract_pokemon_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and transform Pokémon data from API response.
        
        Args:
            raw_data: Raw API response
            
        Returns:
            Cleaned and extracted data
        """
        if not raw_data:
            return {}
        
        return {
            "id": raw_data.get("id"),
            "name": raw_data.get("name", "").capitalize(),
            "height": raw_data.get("height", 0),
            "weight": raw_data.get("weight", 0),
            "base_experience": raw_data.get("base_experience"),
            "image_url": (
                raw_data.get("sprites", {})
                .get("other", {})
                .get("official-artwork", {})
                .get("front_default")
            ),
            "types": [
                t["type"]["name"].capitalize()
                for t in raw_data.get("types", [])
            ],
            "abilities": [
                a["ability"]["name"].replace("-", " ").title()
                for a in raw_data.get("abilities", [])
            ],
            "stats": {
                stat["stat"]["name"]: stat["base_stat"]
                for stat in raw_data.get("stats", [])
            }
        }
