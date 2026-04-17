"""
Hybrid context manager service for multi-turn AI interactions.

Optimizes token usage by combining:
- session summary (compact long-term memory)
- extracted user preferences (stable profile hints)
- recent turns window (short-term conversational precision)
"""

import json
import re
from typing import List, Set, Tuple

from sqlalchemy.orm import Session

from app.models import ChatSessionMemory


class ContextService:
    """Stores memory-efficient chat context by (user_id, session_id)."""

    _MAX_RECENT_TURNS = 8
    _MAX_SUMMARY_CHARS = 700
    _MAX_PREFERENCES = 10
    _MAX_CROSS_SESSION_PREFERENCES = 12
    _CROSS_SESSION_SCAN_LIMIT = 6
    _MIN_MESSAGE_LEN_FOR_SUMMARY = 6

    @classmethod
    def add_turn(
        cls, db: Session, user_id: int, session_id: str, role: str, content: str
    ) -> None:
        cleaned = (content or "").strip()
        if not cleaned:
            return

        memory = cls._get_or_create_memory(db, user_id, session_id)
        recent_turns = cls._load_recent_turns(memory)
        preferences = cls._load_preferences(memory)
        existing_summary = (memory.summary_text or "").strip()

        recent_turns.append({"role": role, "content": cleaned})
        evicted_turns: List[dict] = []
        if len(recent_turns) > cls._MAX_RECENT_TURNS:
            evicted_turns = recent_turns[:-cls._MAX_RECENT_TURNS]
            recent_turns = recent_turns[-cls._MAX_RECENT_TURNS :]

        if role == "user":
            cls._extract_preferences(preferences, cleaned)

        summary_text = cls._merge_summaries(
            existing_summary,
            cls._build_summary(evicted_turns),
            cls._build_summary(recent_turns),
        )

        memory.recent_turns_json = json.dumps(recent_turns, ensure_ascii=True)
        memory.preferences_json = json.dumps(sorted(preferences), ensure_ascii=True)
        memory.summary_text = summary_text
        db.commit()

    @classmethod
    def get_context(cls, db: Session, user_id: int, session_id: str) -> List[dict]:
        memory = cls._get_or_create_memory(db, user_id, session_id)

        recent_turns = cls._load_recent_turns(memory)
        summary = (memory.summary_text or "").strip()
        preferences = sorted(cls._load_preferences(memory))
        cross_session_preferences = cls._load_cross_session_preferences(
            db, user_id, session_id
        )

        memory_blocks: List[dict] = []
        if cross_session_preferences:
            memory_blocks.append(
                {
                    "role": "system",
                    "content": "Cross-session user profile: " + "; ".join(cross_session_preferences),
                }
            )

        if preferences:
            memory_blocks.append(
                {
                    "role": "system",
                    "content": "User preferences profile: " + "; ".join(preferences),
                }
            )

        if summary:
            memory_blocks.append(
                {
                    "role": "system",
                    "content": f"Conversation summary: {summary}",
                }
            )

        return memory_blocks + recent_turns

    @classmethod
    def get_context_size(cls, db: Session, user_id: int, session_id: str) -> int:
        memory = cls._get_or_create_memory(db, user_id, session_id)
        return len(cls._load_recent_turns(memory))

    @classmethod
    def clear_context(cls, db: Session, user_id: int, session_id: str) -> None:
        memory = (
            db.query(ChatSessionMemory)
            .filter(
                ChatSessionMemory.user_id == user_id,
                ChatSessionMemory.session_id == session_id,
            )
            .first()
        )
        if memory:
            db.delete(memory)
            db.commit()

    @classmethod
    def _extract_preferences(cls, preferences: Set[str], message: str) -> None:
        lowered = message.lower()

        starters = (
            "me gusta",
            "mi favorito",
            "prefiero",
            "i like",
            "my favorite",
            "i prefer",
        )

        for starter in starters:
            if starter in lowered:
                idx = lowered.find(starter)
                snippet = message[idx : idx + 90].strip()
                if snippet:
                    preferences.add(snippet)

        # Extract simple pokemon mentions like "pikachu", "charizard", etc.
        names = re.findall(r"\b[a-zA-Z][a-zA-Z0-9-]{2,20}\b", message)
        for token in names:
            low = token.lower()
            if low in {"pokemon", "pokechat", "pokeassistant", "collection", "coleccion"}:
                continue
            if len(preferences) >= cls._MAX_PREFERENCES:
                break
            if low[0].isalpha():
                preferences.add(f"mentioned:{low}")

        if len(preferences) > cls._MAX_PREFERENCES:
            ordered = sorted(preferences)[: cls._MAX_PREFERENCES]
            preferences.clear()
            preferences.update(ordered)

    @classmethod
    def _build_summary(cls, recent: List[dict]) -> str:
        if not recent:
            return ""

        # Summarize older context outside the last 4 turns into a compact line.
        if len(recent) <= 4:
            source_turns = recent
        else:
            source_turns = recent[:-4]

        compact_fragments: List[str] = []
        for turn in source_turns:
            content = turn.get("content", "").strip()
            if len(content) < cls._MIN_MESSAGE_LEN_FOR_SUMMARY:
                continue

            role = turn.get("role", "user")
            prefix = "U" if role == "user" else "A"
            normalized = " ".join(content.split())
            compact_fragments.append(f"{prefix}:{normalized[:90]}")

        summary = " | ".join(compact_fragments)
        return summary[: cls._MAX_SUMMARY_CHARS]

    @classmethod
    def _merge_summaries(cls, *parts: str) -> str:
        cleaned_parts = [part.strip() for part in parts if part and part.strip()]
        if not cleaned_parts:
            return ""

        merged = " | ".join(cleaned_parts)
        if len(merged) <= cls._MAX_SUMMARY_CHARS:
            return merged

        # Keep the most recent information from the tail.
        return merged[-cls._MAX_SUMMARY_CHARS :]

    @staticmethod
    def _safe_load_json_array(raw_value: str) -> List:
        try:
            parsed = json.loads(raw_value or "[]")
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    @classmethod
    def _load_recent_turns(cls, memory: ChatSessionMemory) -> List[dict]:
        loaded = cls._safe_load_json_array(memory.recent_turns_json)
        normalized: List[dict] = []
        for item in loaded:
            if not isinstance(item, dict):
                continue
            role = str(item.get("role", "user")).strip() or "user"
            content = str(item.get("content", "")).strip()
            if not content:
                continue
            normalized.append({"role": role, "content": content})
        return normalized[-cls._MAX_RECENT_TURNS :]

    @classmethod
    def _load_preferences(cls, memory: ChatSessionMemory) -> Set[str]:
        loaded = cls._safe_load_json_array(memory.preferences_json)
        values = [str(item).strip() for item in loaded if str(item).strip()]
        return set(values[: cls._MAX_PREFERENCES])

    @classmethod
    def _load_cross_session_preferences(
        cls, db: Session, user_id: int, active_session_id: str
    ) -> List[str]:
        records = (
            db.query(ChatSessionMemory)
            .filter(
                ChatSessionMemory.user_id == user_id,
                ChatSessionMemory.session_id != active_session_id,
            )
            .order_by(ChatSessionMemory.updated_at.desc())
            .limit(cls._CROSS_SESSION_SCAN_LIMIT)
            .all()
        )

        collected: Set[str] = set()
        for record in records:
            prefs = cls._load_preferences(record)
            for pref in prefs:
                if len(collected) >= cls._MAX_CROSS_SESSION_PREFERENCES:
                    break
                collected.add(pref)
            if len(collected) >= cls._MAX_CROSS_SESSION_PREFERENCES:
                break

        return sorted(collected)

    @staticmethod
    def _get_or_create_memory(db: Session, user_id: int, session_id: str) -> ChatSessionMemory:
        memory = (
            db.query(ChatSessionMemory)
            .filter(
                ChatSessionMemory.user_id == user_id,
                ChatSessionMemory.session_id == session_id,
            )
            .first()
        )
        if memory:
            return memory

        memory = ChatSessionMemory(
            user_id=user_id,
            session_id=session_id,
            summary_text="",
            preferences_json="[]",
            recent_turns_json="[]",
        )
        db.add(memory)
        db.commit()
        db.refresh(memory)
        return memory
