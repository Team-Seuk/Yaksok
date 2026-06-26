"""build_system_prompt + 카메라 인식 맥락(pill_context) 전달 테스트."""

from apps.guidance.adapter.outbound.fake_conversation_repository import FakeConversationRepository
from apps.guidance.app.dtos import AskRequestDto
from apps.guidance.app.ports.output import LLMPort
from apps.guidance.app.prompt import build_system_prompt
from apps.guidance.app.use_cases import AskGuidanceUseCase


def test_prompt_includes_pill_context_when_present() -> None:
    prompt = build_system_prompt(pill_context="매칭 후보: 타이레놀정500밀리그람")
    assert "[방금 촬영한 약]" in prompt
    assert "타이레놀정500밀리그람" in prompt


def test_prompt_omits_pill_section_when_absent() -> None:
    prompt = build_system_prompt()
    assert "[방금 촬영한 약]" not in prompt


class _CapturingLLM(LLMPort):
    """ask 에 들어온 system_prompt 를 보관해 검증한다."""

    def __init__(self) -> None:
        self.system_prompt = ""

    def ask(self, system_prompt: str, user_message: str) -> str:
        self.system_prompt = system_prompt
        return "답변"


def test_use_case_forwards_pill_context_to_prompt() -> None:
    repo = FakeConversationRepository()
    llm = _CapturingLLM()
    use_case = AskGuidanceUseCase(llm=llm, repo=repo)
    conv = repo.create_conversation()

    use_case.execute(
        conv.id,
        AskRequestDto(message="이게 무슨 약이야?", pill_context="포장 제품명: 게보린"),
    )

    assert "게보린" in llm.system_prompt
    assert "[방금 촬영한 약]" in llm.system_prompt
