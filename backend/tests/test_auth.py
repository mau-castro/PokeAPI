"""
Pruebas basicas para endpoints de autenticacion.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.services.user_service import UserService
from app.schemas import UserCreate


# Usar base de datos SQLite en memoria para pruebas
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


@pytest.fixture
def db():
    """Provee una sesion de base de datos para pruebas."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


def test_create_user(db):
    """Prueba la creacion de usuarios."""
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword123"
    )
    
    user = UserService.create_user(db, user_data)
    
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.id is not None


def test_authenticate_user(db):
    """Prueba la autenticacion de usuario."""
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword123"
    )
    
    UserService.create_user(db, user_data)
    
    authenticated_user = UserService.authenticate_user(
        db,
        "test@example.com",
        "testpassword123"
    )
    
    assert authenticated_user is not None
    assert authenticated_user.email == "test@example.com"


def test_authenticate_user_wrong_password(db):
    """Prueba autenticacion con contrasena incorrecta."""
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword123"
    )
    
    UserService.create_user(db, user_data)
    
    authenticated_user = UserService.authenticate_user(
        db,
        "test@example.com",
        "wrongpassword"
    )
    
    assert authenticated_user is None
