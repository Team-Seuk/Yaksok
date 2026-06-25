"""guidance 도메인 API 라우터."""

from fastapi import APIRouter, Depends, HTTPException

from apps.guidance.app.dtos import (
    AskRequestDto,
    ConversationResponseDto,
    MessageResponseDto,
)
from apps.guidance.app.ports.output import ConversationRepositoryPort
from apps.guidance.app.use_cases import AskGuidanceUseCase
from apps.guidance.dependencies import get_ask_guidance_use_case, get_conversation_repo

router = APIRouter(prefix="/api/guidance", tags=["guidance"])


@router.post("/conversations", response_model=ConversationResponseDto)
def create_conversation_endpoint(
    repo: ConversationRepositoryPort = Depends(get_conversation_repo),  # noqa: B008
) -> ConversationResponseDto:
    """새 대화방을 만든다."""
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
    use_case: AskGuidanceUseCase = Depends(get_ask_guidance_use_case),  # noqa: B008
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
    repo: ConversationRepositoryPort = Depends(get_conversation_repo),  # noqa: B008
) -> list[MessageResponseDto]:
    """대화방의 메시지 내역을 반환한다."""
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
