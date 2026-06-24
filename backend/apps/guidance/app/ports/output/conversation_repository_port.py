"""대화 저장소 포트 — use_case가 DB에 의존하는 추상 인터페이스."""

from abc import ABC, abstractmethod

from apps.guidance.domain.entities import Conversation, Message


class ConversationRepositoryPort(ABC):
    @abstractmethod
    def create_conversation(self) -> Conversation:
        """새 대화방을 만들고 반환한다."""
        ...

    @abstractmethod
    def get_conversation(self, conversation_id: str) -> Conversation | None:
        """id로 대화방을 조회한다."""
        ...

    @abstractmethod
    def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        """대화방에 메시지를 추가한다."""
        ...

    @abstractmethod
    def get_messages(self, conversation_id: str) -> list[Message]:
        """대화방의 메시지 목록을 반환한다."""
        ...
