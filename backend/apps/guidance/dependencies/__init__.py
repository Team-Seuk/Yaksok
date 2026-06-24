"""guidance 도메인 의존성 주입."""

from sqlalchemy.orm import Session

from apps.guidance.adapter.outbound.gemini_llm_adapter import GeminiLLMAdapter
from apps.guidance.adapter.outbound.repositories import ConversationRepository
from apps.guidance.app.use_cases import AskGuidanceUseCase


def get_ask_guidance_use_case(db: Session) -> AskGuidanceUseCase:
    """AskGuidanceUseCase에 어댑터를 주입해서 반환한다."""
    return AskGuidanceUseCase(
        llm=GeminiLLMAdapter(),
        repo=ConversationRepository(db),
    )
