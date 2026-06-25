"""테스트용 fake LLM 어댑터 — 실제 Gemini 호출 없이 결정적인 답변을 반환한다."""

from apps.guidance.app.ports.output import LLMPort


class FakeLLMAdapter(LLMPort):
    def __init__(self, reply: str = "테스트 답변입니다.") -> None:
        self._reply = reply

    def ask(self, system_prompt: str, user_message: str) -> str:  # noqa: ARG002
        return self._reply
