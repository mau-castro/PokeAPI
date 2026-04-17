"""
AI bonus endpoints.

Includes image analysis, contextual chat (MCP-style memory),
and collection-based recommendations.
"""

import re
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.schemas import (
    AIChatRequest,
    AIChatResponse,
    AIImageAnalysisResponse,
    AIRecommendationsResponse,
)
from app.services.context_service import ContextService
from app.services.favorite_service import FavoriteService
from app.services.vertex_ai_service import VertexAIService


router = APIRouter(prefix="/ai", tags=["ai-bonus"])

_POKEMON_DOMAIN_TERMS = {
    "pokemon",
    "pokémon",
    "pokedex",
    "pokeball",
    "pokeballs",
    "tipo",
    "tipos",
    "type",
    "types",
    "move",
    "moves",
    "movimiento",
    "movimientos",
    "habilidad",
    "habilidades",
    "ability",
    "abilities",
    "evolucion",
    "evolución",
    "evolve",
    "evolution",
    "starter",
    "legendario",
    "legendary",
    "gym",
    "raid",
    "ivs",
    "evs",
    "nature",
    "team",
    "equipo",
    "charizard",
    "pikachu",
    "bulbasaur",
    "squirtle",
    "mew",
    "mewtwo",
    "eevee",
    "snorlax",
    "gengar",
    "lucario",
    "garchomp",
}

_COMMON_OFFTOPIC_TERMS = {
    "politica",
    "política",
    "presidente",
    "elecciones",
    "bitcoin",
    "crypto",
    "criptomoneda",
    "finanzas",
    "acciones",
    "receta",
    "cocina",
    "medicina",
    "diagnostico",
    "diagnóstico",
    "abogado",
    "demanda",
    "clima",
    "tiempo",
    "futbol",
    "fútbol",
    "nba",
    "programacion",
    "programación",
    "javascript",
    "python",
    "sql",
}


def _normalize_text(value: str) -> str:
    lowered = (value or "").lower().strip()
    return re.sub(r"\s+", " ", lowered)


def _contains_any_term(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def _context_looks_pokemon_related(context: list[dict]) -> bool:
    sample = context[-8:]
    joined = " ".join(item.get("content", "") for item in sample)
    normalized = _normalize_text(joined)
    return _contains_any_term(normalized, _POKEMON_DOMAIN_TERMS)


def _is_pokemon_query(message: str, context: list[dict]) -> bool:
    normalized = _normalize_text(message)
    if not normalized:
        return False

    if _contains_any_term(normalized, _POKEMON_DOMAIN_TERMS):
        return True

    if _contains_any_term(normalized, _COMMON_OFFTOPIC_TERMS):
        return False

    # Permit short follow-ups if the current session context is already Pokemon-related.
    token_count = len(normalized.split())
    if token_count <= 16 and _context_looks_pokemon_related(context):
        return True

    return False


def _domain_restriction_message(message: str) -> str:
    normalized = _normalize_text(message)
    if re.search(r"\b(hello|hi|thanks|please|can you|what|how)\b", normalized):
        return (
            "I am PokeAssistant and can only help with Pokemon topics "
            "(Pokemon, teams, types, moves, evolutions, cards, and collection strategy)."
        )

    return (
        "Soy PokeAssistant y solo respondo temas de Pokemon "
        "(Pokemon, equipos, tipos, movimientos, evoluciones, cartas y estrategia de coleccion)."
    )


@router.post("/analyze-image", response_model=AIImageAnalysisResponse)
async def analyze_image(
    image: UploadFile = File(...),
    note: str = Form(default=""),
    language: str = Form(default="es"),
    current_user=Depends(get_current_user),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported",
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image payload",
        )

    try:
        normalized_language = language.lower().strip()
        target_language = "en" if normalized_language == "en" else "es"
        analysis = VertexAIService.analyze_pokemon_image(
            image_bytes,
            image.content_type,
            target_language,
        )
        if note:
            analysis["confidence_note"] = f"{analysis.get('confidence_note', '')} {note}".strip()
        return analysis
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to analyze the image",
        )


@router.post("/chat", response_model=AIChatResponse)
def chat_with_ai(
    payload: AIChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_id = payload.session_id or str(uuid4())
    user_id = int(current_user.id)

    current_context = ContextService.get_context(db, user_id, session_id)
    if not _is_pokemon_query(payload.message, current_context):
        return {
            "session_id": session_id,
            "reply": _domain_restriction_message(payload.message),
            "context_size": ContextService.get_context_size(db, user_id, session_id),
        }

    ContextService.add_turn(db, user_id, session_id, "user", payload.message)
    context = ContextService.get_context(db, user_id, session_id)

    try:
        reply = VertexAIService.chat_with_context(payload.message, context)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider failed to generate chat response: {exc}"
        )

    ContextService.add_turn(db, user_id, session_id, "assistant", reply)
    context_size = ContextService.get_context_size(db, user_id, session_id)

    return {
        "session_id": session_id,
        "reply": reply,
        "context_size": context_size,
    }


@router.get("/recommendations", response_model=AIRecommendationsResponse)
def ai_recommendations(
    db: Session = Depends(get_db),
    language: str = Query(default="es"),
    current_user=Depends(get_current_user),
):
    favorites = FavoriteService.get_user_favorites(db, int(current_user.id), limit=100, offset=0)
    favorite_names = [item.pokemon_name for item in favorites]
    target_language = "en" if language.lower().strip() == "en" else "es"

    try:
        result = VertexAIService.generate_recommendations_with_language(
            favorite_names,
            target_language,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate recommendations",
        )

    return result
