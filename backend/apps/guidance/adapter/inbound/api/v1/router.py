"""guidance 도메인 API 라우터."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.guidance.adapter.outbound.repositories import ConversationRepository
from apps.guidance.app.dtos import (
    AskRequestDto,
    ConversationResponseDto,
    MessageResponseDto,
)
from apps.guidance.app.use_cases import AskGuidanceUseCase
from apps.guidance.dependencies import get_ask_guidance_use_case
from core.db import get_db

router = APIRouter(prefix="/api/guidance", tags=["guidance"])


@router.post("/conversations", response_model=ConversationResponseDto)
def create_conversation_endpoint(db: Session = Depends(get_db)) -> ConversationResponseDto:  # noqa: B008
    """새 대화방을 만든다."""
    repo = ConversationRepository(db)
    conversation = repo.create_conversation()
    return ConversationResponseDto(
        id=conversation.id,
        created_at=conversation.created_at,
    )


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessageResponseDto,
)
def ask_message(
    conversation_id: str,
    request: AskRequestDto,
    db: Session = Depends(get_db),  # noqa: B008
    use_case: AskGuidanceUseCase = Depends(
        lambda db=Depends(get_db): get_ask_guidance_use_case(db)
    ),  # noqa: B008, E501
) -> MessageResponseDto:
    """질문을 보내고 AI 답변을 받는다."""
    try:
        return use_case.execute(conversation_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponseDto],
)
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db),  # noqa: B008
) -> list[MessageResponseDto]:
    """대화방의 메시지 내역을 반환한다."""
    repo = ConversationRepository(db)
    messages = repo.get_messages(conversation_id)
    return [
        MessageResponseDto(
            id=m.id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]
