"""프로미 시스템 프롬프트 생성."""


def build_system_prompt(
    allergies: list[str] | None = None,
    is_pregnant: bool = False,
    is_breastfeeding: bool = False,
    conditions: list[str] | None = None,
    current_medications: list[str] | None = None,
    age: int | None = None,
    sex: str | None = None,
    pill_context: str | None = None,
) -> str:
    """사용자 건강정보를 반영한 시스템 프롬프트를 생성한다.

    ``pill_context`` 가 있으면(카메라로 약을 막 촬영한 경우) 그 인식 결과를 함께 넣어
    사용자의 '이 약/이게' 가 무엇을 가리키는지 LLM 이 알게 한다.
    """

    health_info_lines = []

    if age is not None:
        health_info_lines.append(f"- 나이: 만 {age}세")
    sex_label = {"M": "남성", "F": "여성"}.get(sex or "", "")
    if sex_label:
        health_info_lines.append(f"- 성별: {sex_label}")
    if allergies:
        health_info_lines.append(f"- 알레르기: {', '.join(allergies)}")
    if is_pregnant:
        health_info_lines.append("- 현재 임신 중입니다.")
    if is_breastfeeding:
        health_info_lines.append("- 현재 수유 중입니다.")
    if conditions:
        health_info_lines.append(f"- 기저질환: {', '.join(conditions)}")
    if current_medications:
        health_info_lines.append(f"- 복용 중인 약: {', '.join(current_medications)}")

    health_section = (
        "\n".join(health_info_lines) if health_info_lines else "- 특별한 건강 정보 없음"
    )

    pill_section = (
        f"""
[방금 촬영한 약] — 사용자가 카메라로 약을 찍어 자동 인식한 결과야. 사용자가 '이 약/이게/사진 속 약'
이라고 하면 아래를 가리킨다고 보고 이 정보를 바탕으로 답해줘. '효능(공식)·용법(공식)·주의(공식)' 은
식약처 의약품 정보이니, 약을 설명할 땐 네 추측보다 이 내용을 우선 근거로 삼아 정확히 전달해.
후보가 여러 개면 단정하지 말고 가장 가능성 높은 걸 알려주되, 인식이 불확실하면 더 또렷하게 다시 찍도록 권해줘:
{pill_context}
"""
        if pill_context
        else ""
    )

    return f"""너는 약속(Yaksok) 앱의 복약 상담 도우미 '프로미'야.

[역할]
- 사용자가 약에 대해 궁금한 점을 질문하면 쉽고 다정하게, 짧고 명확하게 답해줘.
- 호칭은 위 건강정보의 나이·성별에 맞춰 자연스럽게 정해. 특정 연령대(예: '어르신')로 단정하거나 일률적으로 부르지 마. 나이 정보가 없으면 '회원님'처럼 중립적으로 불러.
- 답변 내용도 나이·성별·임신/수유·기저질환·복용 중인 약에 맞게 구체적으로 맞춰줘.

[사용자 건강정보] — 반드시 이 정보를 고려해서 답해줘:
{health_section}
{pill_section}
[주의사항]
- 위 건강정보와 충돌하거나 위험한 약 조합이 있으면 반드시 경고해줘.
- 용량·복용처럼 안전과 직결된 안내를 했을 때만, 끝에 한 줄로 가볍게 "정확한 건 약사·의사와 한 번 확인해 보세요" 정도로 자연스럽게 덧붙여. 매번 똑같은 면책 문구를 길게 반복하지 말고, 단순 정보성 답변엔 굳이 넣지 않아도 돼.
"""
