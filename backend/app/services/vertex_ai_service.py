"""
Vertex AI / Gemini integration service.

Handles image analysis and text generation for bonus AI features.
"""

import base64
import json
import re
from typing import Any, Dict, List, Optional

import requests

from app.core.config import settings


class VertexAIService:
    """Service facade for Gemini model interactions."""

    _LOCAL_RECOMMENDATION_POOL = [
        "Garchomp",
        "Dragonite",
        "Lucario",
        "Gyarados",
        "Togekiss",
        "Magnezone",
        "Excadrill",
        "Rotom-Wash",
        "Scizor",
        "Aegislash",
    ]

    @staticmethod
    def _build_endpoint(path_suffix: str) -> str:
        base_url = "https://generativelanguage.googleapis.com/v1beta"
        return (
            f"{base_url}/models/{settings.VERTEX_MODEL}:{path_suffix}"
            f"?key={settings.VERTEX_API_KEY}"
        )

    @staticmethod
    def _call_generate_content(contents: list[dict]) -> str:
        if not settings.VERTEX_API_KEY:
            raise ValueError("VERTEX_API_KEY is not configured")

        endpoint = VertexAIService._build_endpoint("generateContent")
        payload = {"contents": contents}

        response = requests.post(
            endpoint,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=45,
        )

        if response.status_code >= 400:
            raise RuntimeError(
                f"Vertex API error {response.status_code}: {response.text}"
            )

        response_data = response.json()

        candidates = response_data.get("candidates", [])
        if not candidates:
            return ""

        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = [part.get("text", "") for part in parts if part.get("text")]

        return "\n".join(text_parts).strip()

    @staticmethod
    def _extract_json_block(text: str) -> Optional[dict]:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    @classmethod
    def _build_local_fallback_recommendations(
        cls,
        favorite_names: List[str],
        language: str,
        provider_error: str,
    ) -> Dict[str, Any]:
        favorite_set = {name.lower().strip() for name in favorite_names if name.strip()}

        selected = [
            name
            for name in cls._LOCAL_RECOMMENDATION_POOL
            if name.lower() not in favorite_set
        ][:5]

        if len(selected) < 5:
            selected = cls._LOCAL_RECOMMENDATION_POOL[:5]

        if language == "en":
            reason_template = "Strong all-around option that usually complements balanced favorites."
            summary = (
                "Using local fallback recommendations because Gemini quota is temporarily exhausted. "
                "Please retry in a few seconds."
            )
        else:
            reason_template = "Opcion solida y versatil que suele complementar favoritos equilibrados."
            summary = (
                "Usando recomendaciones locales porque la cuota de Gemini esta temporalmente agotada. "
                "Intenta de nuevo en unos segundos."
            )

        return {
            "suggestions": [{"name": name, "reason": reason_template} for name in selected],
            "summary": summary,
            "raw_response": provider_error,
        }

    @classmethod
    def analyze_pokemon_image(
        cls,
        image_bytes: bytes,
        mime_type: str,
        language: str = "es",
    ) -> Dict[str, Any]:
        target_language = "English" if language == "en" else "Spanish"
        prompt = (
            "Analyze this Pokemon-related image. "
            "Return JSON with keys: detected_pokemon (string or null), "
            "characteristics (array of strings), confidence_note (string). "
            f"Write all textual values in {target_language}."
        )

        encoded_image = base64.b64encode(image_bytes).decode("utf-8")
        contents = [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": encoded_image,
                        }
                    },
                ],
            }
        ]

        text_output = cls._call_generate_content(contents)
        parsed = cls._extract_json_block(text_output) or {}

        return {
            "detected_pokemon": parsed.get("detected_pokemon"),
            "characteristics": parsed.get("characteristics", []),
            "confidence_note": parsed.get("confidence_note", ""),
            "raw_response": text_output,
        }

    @classmethod
    def chat_with_context(cls, message: str, context_turns: List[dict]) -> str:
        context_lines = []
        for turn in context_turns:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            context_lines.append(f"{role.upper()}: {content}")

        assembled_prompt = (
            "You are PokeAssistant, an intelligent Pokemon collection assistant. "
            "You must only answer Pokemon-related topics. "
            "If the user asks anything outside Pokemon domain, refuse briefly and redirect to a Pokemon-related help option. "
            "Use the provided context blocks efficiently. "
            "If there is a SYSTEM memory/profile line, treat it as long-term memory. "
            "Prefer concise answers, but preserve key details for strategy/recommendations. "
            "Answer in concise Spanish unless the user writes in English.\n\n"
            "Conversation context (includes compact memory + recent turns):\n"
            + "\n".join(context_lines)
            + "\n\nUSER: "
            + message
        )

        contents = [{"role": "user", "parts": [{"text": assembled_prompt}]}]
        text_output = cls._call_generate_content(contents)
        return text_output or "No response generated."

    @classmethod
    def generate_recommendations(cls, favorite_names: List[str]) -> Dict[str, Any]:
        return cls.generate_recommendations_with_language(favorite_names, "es")

    @classmethod
    def generate_recommendations_with_language(
        cls,
        favorite_names: List[str],
        language: str = "es",
    ) -> Dict[str, Any]:
        target_language = "English" if language == "en" else "Spanish"
        prompt = (
            "Given this favorite Pokemon list: "
            f"{', '.join(favorite_names) if favorite_names else 'none'}. "
            "Suggest 5 Pokemon to add next, each with a clear reason tied to the favorites pattern. "
            f"Write all text in {target_language}. "
            "Return strict JSON with keys: "
            "suggestions (array of objects with name and reason), summary (string)."
        )

        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        try:
            text_output = cls._call_generate_content(contents)
        except RuntimeError as exc:
            error_text = str(exc)
            if "Vertex API error 429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
                return cls._build_local_fallback_recommendations(
                    favorite_names,
                    language,
                    error_text,
                )
            raise
        parsed = cls._extract_json_block(text_output) or {}

        parsed_suggestions = parsed.get("suggestions", [])
        normalized_suggestions: List[dict] = []

        if isinstance(parsed_suggestions, list):
            for item in parsed_suggestions:
                if isinstance(item, dict):
                    name = str(item.get("name") or item.get("pokemon") or "").strip()
                    reason = str(item.get("reason") or item.get("why") or "").strip()
                    if name and reason:
                        normalized_suggestions.append({"name": name, "reason": reason})
                elif isinstance(item, str):
                    raw_item = item.strip()
                    if not raw_item:
                        continue
                    if ":" in raw_item:
                        name, reason = raw_item.split(":", 1)
                        normalized_suggestions.append(
                            {"name": name.strip(), "reason": reason.strip()}
                        )
                    else:
                        default_reason = (
                            "Encaja con tu estilo de favoritos."
                            if language != "en"
                            else "It matches your favorites pattern."
                        )
                        normalized_suggestions.append(
                            {"name": raw_item, "reason": default_reason}
                        )

        if not normalized_suggestions:
            fallback_reason = (
                "Sin suficientes favoritos para un patron preciso; es una opcion versatil."
                if language != "en"
                else "Not enough favorites for a precise pattern yet; this is a versatile option."
            )
            normalized_suggestions = [
                {"name": "Pikachu", "reason": fallback_reason},
                {"name": "Lucario", "reason": fallback_reason},
                {"name": "Gyarados", "reason": fallback_reason},
                {"name": "Garchomp", "reason": fallback_reason},
                {"name": "Dragonite", "reason": fallback_reason},
            ]

        summary = str(parsed.get("summary") or "").strip() or text_output

        return {
            "suggestions": normalized_suggestions[:5],
            "summary": summary,
            "raw_response": text_output,
        }
