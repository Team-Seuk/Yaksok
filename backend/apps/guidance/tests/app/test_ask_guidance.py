"""AskGuidanceUseCase 단위 테스트 — LLM·DB 없이 fake 주입."""

import pytest

from apps.guidance.adapter.outbound.fake_conversation_repository import FakeConversationRepository
from apps.guidance.adapter.outbound.fake_llm_adapter import FakeLLMAdapter
from apps.guidance.app.dtos import AskRequestDto, HealthInfoDto
from apps.guidance.app.use_cases import AskGuidanceUseCase


def _make_use_case(reply: str = "복용 가능합니다.") -> tuple[AskGuidanceUseCase, FakeConversationRepository]:
    repo = FakeConversationRepository()
    llm = FakeLLMAdapter(reply=reply)
    return AskGuidanceUseCase(llm=llm, repo=repo), repo


def test_ask_returns_llm_reply() -> None:
    use_case, repo = _make_use_case(reply="하루 2회 복용하세요.")
    conv = repo.create_conversation()

    request = AskRequestDto(message="타이레놀 복용 방법이 궁금해요.")
    result = use_case.execute(conv.id, request)

    assert result.content == "하루 2회 복용하세요."
    assert result.role == "assistant"


def test_ask_saves_user_and_assistant_messages() -> None:
    use_case, repo = _make_use_case()
    conv = repo.create_conversation()

    use_case.execute(conv.id, AskRequestDto(message="빈속에 먹어도 되나요?"))
    messages = repo.get_messages(conv.id)

    assert len(messages) == 2
    assert messages[0].role == "user"
    assert messages[0].content == "빈속에 먹어도 되나요?"
    assert messages[1].role == "assistant"


def test_ask_raises_for_unknown_conversation() -> None:
    use_case, _ = _make_use_case()
    with pytest.raises(ValueError, match="대화방을 찾을 수 없습니다"):
        use_case.execute("nonexistent-id", AskRequestDto(message="안녕"))


def test_health_info_is_accepted() -> None:
    use_case, repo = _make_use_case(reply="주의가 필요합니다.")
    conv = repo.create_conversation()

    health = HealthInfoDto(
        allergies=["페니실린"],
        is_pregnant=True,
        current_medications=["철분제"],
    )
    result = use_case.execute(conv.id, AskRequestDto(message="이 약 먹어도 되나요?", health_info=health))

    assert result.content == "주의가 필요합니다."


def test_multiple_turns_accumulate_messages() -> None:
    use_case, repo = _make_use_case()
    conv = repo.create_conversation()

    use_case.execute(conv.id, AskRequestDto(message="첫 번째 질문"))
    use_case.execute(conv.id, AskRequestDto(message="두 번째 질문"))

    messages = repo.get_messages(conv.id)
    assert len(messages) == 4  # user·assistant × 2
