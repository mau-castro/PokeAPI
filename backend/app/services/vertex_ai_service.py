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
    def analyze_pokemon_image(cls, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        prompt = (
            "Analyze this Pokemon-related image. "
            "Return JSON with keys: detected_pokemon (string or null), "
            "characteristics (array of strings), confidence_note (string)."
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
        prompt = (
            "Given this favorite Pokemon list: "
            f"{', '.join(favorite_names) if favorite_names else 'none'}. "
            "Suggest 5 Pokemon to add next and explain briefly in Spanish. "
            "Return JSON with keys: suggestions (array), summary (string)."
        )

        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        text_output = cls._call_generate_content(contents)
        parsed = cls._extract_json_block(text_output) or {}

        return {
            "suggestions": parsed.get("suggestions", []),
            "summary": parsed.get("summary", text_output),
            "raw_response": text_output,
        }
