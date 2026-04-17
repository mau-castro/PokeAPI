"""
Factory principal de la aplicacion FastAPI.

Crea y configura la aplicacion con rutas,
middleware y manejadores de errores.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import init_db
from app.api import auth, pokemon, favorites, ai


def create_app() -> FastAPI:
    """
    Crea y configura la aplicacion FastAPI.
    
    Returns:
        Instancia FastAPI configurada
    """
    app = FastAPI(
        title="PokéDex Manager API",
        description="A comprehensive Pokémon collection manager with PokéAPI integration",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
    )
    
    # Configurar middleware CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Inicializar base de datos
    @app.on_event("startup")
    def startup():
        """Inicializa la base de datos al arrancar la aplicacion."""
        init_db()
    
    # Endpoint de health check
    @app.get("/health")
    def health_check():
        """Endpoint de health check para monitoreo."""
        return {"status": "healthy"}
    
    # Incluir routers
    app.include_router(auth.router)
    app.include_router(pokemon.router)
    app.include_router(favorites.router)
    app.include_router(ai.router)
    
    # Manejadores globales de excepciones
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """Maneja excepciones inesperadas."""
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    
    return app


# Crear instancia de aplicacion
app = create_app()
