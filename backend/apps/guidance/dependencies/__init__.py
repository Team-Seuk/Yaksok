"""guidance 도메인 의존성 주입."""

from fastapi import Depends
from sqlalchemy.orm import Session

from apps.guidance.adapter.outbound.gemini_llm_adapter import GeminiLLMAdapter
from apps.guidance.adapter.outbound.repositories import ConversationRepository
from apps.guidance.app.ports.output import ConversationRepositoryPort
from apps.guidance.app.use_cases import AskGuidanceUseCase
from core.db import get_db


def get_conversation_repo(
    db: Session = Depends(get_db),  # noqa: B008
) -> ConversationRepositoryPort:
    return ConversationRepository(db)


def get_ask_guidance_use_case(
    db: Session = Depends(get_db),  # noqa: B008
) -> AskGuidanceUseCase:
    """AskGuidanceUseCase에 어댑터를 주입해서 반환한다(FastAPI 의존성)."""
    return AskGuidanceUseCase(
        llm=GeminiLLMAdapter(),
        repo=ConversationRepository(db),
    )
