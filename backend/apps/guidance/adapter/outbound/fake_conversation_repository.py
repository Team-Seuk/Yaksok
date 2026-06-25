"""테스트용 fake 대화 저장소 — DB 없이 인메모리로 동작한다."""

from datetime import UTC, datetime
from uuid import uuid4

from apps.guidance.app.ports.output import ConversationRepositoryPort
from apps.guidance.domain.entities import Conversation, Message


class FakeConversationRepository(ConversationRepositoryPort):
    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}
        self._messages: dict[str, list[Message]] = {}

    def create_conversation(self) -> Conversation:
        conv = Conversation(id=str(uuid4()), created_at=datetime.now(tz=UTC))
        self._conversations[conv.id] = conv
        self._messages[conv.id] = []
        return conv

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self._conversations.get(conversation_id)

    def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        msg = Message(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.now(tz=UTC),
        )
        self._messages[conversation_id].append(msg)
        return msg

    def get_messages(self, conversation_id: str) -> list[Message]:
        return list(self._messages.get(conversation_id, []))
