"""AskGuidanceUseCase — 복약 상담 핵심 흐름."""

from apps.guidance.app.dtos import AskRequestDto, MessageResponseDto
from apps.guidance.app.ports.output import ConversationRepositoryPort, LLMPort
from apps.guidance.app.prompt import build_system_prompt


class AskGuidanceUseCase:
    def __init__(self, llm: LLMPort, repo: ConversationRepositoryPort) -> None:
        self._llm = llm
        self._repo = repo

    def execute(
        self,
        conversation_id: str,
        request: AskRequestDto,
    ) -> MessageResponseDto:
        # 대화방 존재 확인
        conversation = self._repo.get_conversation(conversation_id)
        if conversation is None:
            raise ValueError(f"대화방을 찾을 수 없습니다: {conversation_id}")

        # 사용자 메시지 저장
        self._repo.add_message(conversation_id, role="user", content=request.message)

        # 시스템 프롬프트 생성
        system_prompt = build_system_prompt(
            allergies=request.health_info.allergies,
            is_pregnant=request.health_info.is_pregnant,
            is_breastfeeding=request.health_info.is_breastfeeding,
            conditions=request.health_info.conditions,
            current_medications=request.health_info.current_medications,
            age=request.health_info.age,
            sex=request.health_info.sex,
        )

        # Gemini 호출
        answer = self._llm.ask(system_prompt, request.message)

        # AI 답변 저장
        saved = self._repo.add_message(conversation_id, role="assistant", content=answer)

        return MessageResponseDto(
            id=saved.id,
            role=saved.role,
            content=saved.content,
            created_at=saved.created_at,
        )
