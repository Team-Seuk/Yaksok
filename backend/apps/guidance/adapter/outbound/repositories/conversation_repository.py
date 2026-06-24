"""conversations · messages 테이블 저장/조회 리포지토리."""

from sqlalchemy.orm import Session

from apps.guidance.adapter.outbound.orm import ConversationOrm, MessageOrm
from apps.guidance.app.ports.output import ConversationRepositoryPort
from apps.guidance.domain.entities import Conversation, Message


def _to_message(orm: MessageOrm) -> Message:
    return Message(
        id=orm.id,
        conversation_id=orm.conversation_id,
        role=orm.role,
        content=orm.content,
        created_at=orm.created_at,
    )


def _to_conversation(orm: ConversationOrm) -> Conversation:
    return Conversation(
        id=orm.id,
        created_at=orm.created_at,
        messages=[_to_message(m) for m in orm.messages],
    )


class ConversationRepository(ConversationRepositoryPort):
    def __init__(self, db: Session) -> None:
        self._db = db

    def create_conversation(self) -> Conversation:
        """새 대화방을 만들고 저장한다."""
        orm = ConversationOrm()
        self._db.add(orm)
        self._db.commit()
        self._db.refresh(orm)
        return _to_conversation(orm)

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        """id로 대화방을 조회한다. 없으면 None 반환."""
        orm = self._db.get(ConversationOrm, conversation_id)
        if orm is None:
            return None
        return _to_conversation(orm)

    def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        """대화방에 메시지를 추가하고 저장한다."""
        orm = MessageOrm(conversation_id=conversation_id, role=role, content=content)
        self._db.add(orm)
        self._db.commit()
        self._db.refresh(orm)
        return _to_message(orm)

    def get_messages(self, conversation_id: str) -> list[Message]:
        """대화방의 메시지 목록을 반환한다."""
        conversation = self._db.get(ConversationOrm, conversation_id)
        if conversation is None:
            return []
        return [_to_message(m) for m in conversation.messages]
