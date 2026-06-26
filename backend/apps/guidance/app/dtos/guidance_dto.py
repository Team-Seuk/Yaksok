"""guidance 도메인 DTO — 요청/응답 데이터 구조."""

from datetime import datetime

from pydantic import BaseModel


class HealthInfoDto(BaseModel):
    """사용자 건강정보."""

    allergies: list[str] = []
    is_pregnant: bool = False
    is_breastfeeding: bool = False
    conditions: list[str] = []
    current_medications: list[str] = []
    age: int | None = None
    sex: str | None = None  # "M" | "F" | "other"


class AskRequestDto(BaseModel):
    """메시지 전송 요청 — 질문 내용 + 건강정보 (+ 카메라 인식 맥락)."""

    message: str
    health_info: HealthInfoDto = HealthInfoDto()
    # 카메라로 약을 막 촬영해 들어온 경우의 인식 결과 요약(없으면 None).
    pill_context: str | None = None


class MessageResponseDto(BaseModel):
    """메시지 응답 — AI 답변."""

    id: str
    role: str
    content: str
    created_at: datetime


class ConversationResponseDto(BaseModel):
    """대화방 응답."""

    id: str
    created_at: datetime
