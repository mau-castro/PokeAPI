"""
Conexion a base de datos y gestion de sesiones.

Este modulo provee el engine y la fabrica de sesiones
para interactuar con la base de datos MySQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool

from app.core.config import settings


# Construir URL de base de datos
if settings.DATABASE_URL:
    DATABASE_URL = settings.DATABASE_URL
else:
    DATABASE_URL = (
        f"mysql+mysqlconnector://{settings.DB_USER}:"
        f"{settings.DB_PASSWORD}@{settings.DB_HOST}:"
        f"{settings.DB_PORT}/{settings.DB_NAME}"
    )

# Esta app usa sesiones SQLAlchemy sincronas.
# Si llega un DSN async (aiomysql), se normaliza a mysqlconnector.
if DATABASE_URL.startswith("mysql+aiomysql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "mysql+aiomysql://",
        "mysql+mysqlconnector://",
        1,
    )

# Crear engine con pool de conexiones
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Fabrica de sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base para modelos ORM
Base = declarative_base()


def get_db():
    """
    Funcion de inyeccion de dependencias para sesiones de base de datos.
    
    Yields:
        Sesion de base de datos
        
    Example:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Inicializa las tablas de la base de datos."""
    Base.metadata.create_all(bind=engine)
