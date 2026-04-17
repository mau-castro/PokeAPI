"""
Esquemas Pydantic para validacion y serializacion de request/response.

Estos esquemas manejan validacion de datos, serializacion y documentacion de API.
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import Optional


# ============================================================================
# Esquemas de autenticacion
# ============================================================================

class UserBase(BaseModel):
    """Esquema base de usuario con campos comunes."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Esquema para registro de usuario."""
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Esquema para credenciales de inicio de sesion."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Esquema para respuesta de usuario (sin datos sensibles)."""
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Esquema para respuesta con token JWT."""
    access_token: str
    token_type: str = "bearer"


# ============================================================================
# Esquemas de Pokemon
# ============================================================================

class PokemonBaseInfo(BaseModel):
    """Informacion base de un Pokemon desde PokéAPI."""
    id: int
    name: str
    height: int
    weight: int
    base_experience: Optional[int] = None
    is_default: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)


class PokemonDetail(PokemonBaseInfo):
    """Informacion detallada de un Pokemon."""
    image_url: Optional[str] = None
    types: list[str] = Field(default_factory=list)
    stats: dict = Field(default_factory=dict)
    abilities: list[str] = Field(default_factory=list)


class PokemonFavoriteCreate(BaseModel):
    """Esquema para agregar un Pokemon a favoritos."""
    pokemon_id: int
    pokemon_name: str


class PokemonFavoriteResponse(BaseModel):
    """Esquema para respuesta de Pokemon favorito."""
    id: int
    user_id: int
    pokemon_id: int
    pokemon_name: str
    added_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Esquemas de error
# ============================================================================

class ErrorResponse(BaseModel):
    """Esquema estandar de respuesta de error."""
    detail: str
    error_code: Optional[str] = None


# ============================================================================
# Esquemas de AI bonus
# ============================================================================

class AIImageAnalysisResponse(BaseModel):
    """Respuesta del analisis de imagen con modelo multimodal."""
    detected_pokemon: Optional[str] = None
    characteristics: list[str] = Field(default_factory=list)
    confidence_note: str = ""
    raw_response: str = ""


class AIChatRequest(BaseModel):
    """Entrada para chat con contexto."""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None


class AIChatResponse(BaseModel):
    """Salida del chat con contexto."""
    session_id: str
    reply: str
    context_size: int


class AIRecommendationItem(BaseModel):
    """Elemento de recomendacion con explicacion."""
    name: str
    reason: str


class AIRecommendationsResponse(BaseModel):
    """Respuesta de recomendaciones inteligentes."""
    suggestions: list[AIRecommendationItem] = Field(default_factory=list)
    summary: str = ""
    raw_response: str = ""
