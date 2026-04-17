"""
Database models for application entities.

This module defines SQLAlchemy ORM models for database tables,
following Clean Code principles with clear naming and documentation.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime

from app.core.database import Base


class User(Base):
    """
    User model representing application users.
    
    Attributes:
        id: Unique user identifier (primary key)
        username: Unique username
        email: User email address
        hashed_password: Bcrypt hashed password
        is_active: Whether the user account is active
        created_at: Account creation timestamp
    """
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


class PokemonFavorite(Base):
    """
    Pokemon favorite model for tracking user's favorite Pokémon.
    
    Attributes:
        id: Unique favorite record identifier
        user_id: Foreign key to User
        pokemon_id: PokéAPI Pokémon ID
        pokemon_name: Pokémon name (cached from PokéAPI)
        added_at: When the Pokémon was added to favorites
    """
    
    __tablename__ = "pokemon_favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pokemon_id = Column(Integer, nullable=False)
    pokemon_name = Column(String(100), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return (
            f"<PokemonFavorite(user_id={self.user_id}, "
            f"pokemon_name={self.pokemon_name})>"
        )
