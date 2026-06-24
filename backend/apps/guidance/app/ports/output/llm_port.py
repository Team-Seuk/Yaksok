"""LLM 포트 — use_case 가 AI 호출에 의존하는 추상 인터페이스."""

from abc import ABC, abstractmethod


class LLMPort(ABC):
    @abstractmethod
    def ask(self, system_prompt: str, user_message: str) -> str:
        """시스템 프롬프트와 사용자 질문을 받아 AI 답변 텍스트를 반환한다."""
        ...
