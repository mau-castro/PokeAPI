"""
Funciones utilitarias de la aplicacion.

Contiene helpers para operaciones comunes en la app.
"""

import re
from typing import List


def sanitize_input(value: str, max_length: int = 100) -> str:
    """
    Sanitiza texto removiendo caracteres potencialmente peligrosos.
    
    Args:
        value: Texto de entrada a sanitizar
        max_length: Longitud maxima permitida
        
    Returns:
        Texto sanitizado
    """
    if not isinstance(value, str):
        return ""
    
    # Eliminar espacios al inicio y al final
    sanitized = value.strip()
    
    # Limitar longitud
    sanitized = sanitized[:max_length]
    
    # Eliminar caracteres especiales (mantener alfanumericos, espacios y puntuacion basica)
    sanitized = re.sub(r"[^\w\s\-]", "", sanitized)
    
    return sanitized


def extract_bearer_token(authorization_header: str) -> str:
    """
    Extrae el bearer token del header Authorization.
    
    Args:
        authorization_header: Valor completo del header Authorization
        
    Returns:
        Token o string vacio si es invalido
    """
    if not authorization_header:
        return ""
    
    parts = authorization_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    
    return ""


def validate_email(email: str) -> bool:
    """
    Valida el formato de email.
    
    Args:
        email: Email a validar
        
    Returns:
        True si el formato es valido, False en caso contrario
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def paginate_list(
    items: List,
    limit: int,
    offset: int
) -> tuple[List, int]:
    """
    Pagina una lista de elementos.
    
    Args:
        items: Lista a paginar
        limit: Elementos por pagina
        offset: Offset inicial
        
    Returns:
        Tupla de (paginated_items, total_count)
    """
    total = len(items)
    paginated = items[offset : offset + limit]
    
    return paginated, total
