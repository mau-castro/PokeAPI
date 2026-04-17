"""
Configuracion de la aplicacion.

Este modulo maneja la configuracion desde variables de entorno,
usando Pydantic para validacion y seguridad de tipos.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Ajustes de la aplicacion cargados desde variables de entorno.
    
    Attributes:
        DATABASE_URL: URL completa de conexion a base de datos
        DB_HOST: Hostname de base de datos
        DB_USER: Usuario de base de datos
        DB_PASSWORD: Contrasena de base de datos
        DB_NAME: Nombre de base de datos
        DB_PORT: Puerto de base de datos
        SECRET_KEY: Clave secreta para codificar JWT
        ALGORITHM: Algoritmo para JWT
        ACCESS_TOKEN_EXPIRE_MINUTES: Expiracion del token
        DEBUG: Bandera de modo debug
        POKEAPI_BASE_URL: URL base de PokéAPI
        CLAUDE_API_KEY: API key de Claude AI
        CLAUDE_MODEL: Identificador del modelo Claude
    """
    
    # Configuracion de base de datos
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_USER: str = "root"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "pokedex"
    DB_PORT: int = 3306
    
    # Configuracion de seguridad
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuracion del servidor
    DEBUG: bool = False
    
    # APIs externas
    POKEAPI_BASE_URL: str = "https://pokeapi.co/api/v2"
    CLAUDE_API_KEY: Optional[str] = None
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuracion
settings = Settings()
