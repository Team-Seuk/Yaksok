"""guidance 도메인 엔티티."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Message:
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime


@dataclass
class Conversation:
    id: str
    created_at: datetime
    messages: list[Message] = field(default_factory=list)
