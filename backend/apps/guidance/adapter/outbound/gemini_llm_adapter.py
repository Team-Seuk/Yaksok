"""Gemini LLM 어댑터 — LLMPort 구현체."""

from apps.guidance.app.ports.output import LLMPort
from core.gemini import generate


class GeminiLLMAdapter(LLMPort):
    def ask(self, system_prompt: str, user_message: str) -> str:
        """시스템 프롬프트와 사용자 질문을 Gemini에 보내고 답변을 반환한다."""
        contents = [system_prompt, user_message]
        return generate(contents)
