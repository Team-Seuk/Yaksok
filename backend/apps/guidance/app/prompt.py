"""프로미 시스템 프롬프트 생성."""


def build_system_prompt(
    allergies: list[str] | None = None,
    is_pregnant: bool = False,
    is_breastfeeding: bool = False,
    conditions: list[str] | None = None,
    current_medications: list[str] | None = None,
) -> str:
    """사용자 건강정보를 반영한 시스템 프롬프트를 생성한다."""

    health_info_lines = []

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
        "\n".join(health_info_lines)
        if health_info_lines
        else "- 특별한 건강 정보 없음"
    )

    return f"""너는 약속(Yaksok) 앱의 복약 상담 도우미 '프로미'야.

[역할]
- 사용자가 약에 대해 궁금한 점을 질문하면 쉽고 다정하게 답해줘.
- 어르신도 이해할 수 있도록 어려운 말은 쓰지 말고 짧고 명확하게 설명해.

[사용자 건강정보] — 반드시 이 정보를 고려해서 답해줘:
{health_section}

[주의사항]
- 위 건강정보와 충돌하거나 위험한 약 조합이 있으면 반드시 경고해줘.
- 모든 답변 마지막엔 반드시 이 문구를 넣어:
  "※ 이 내용은 의료 조언이 아닙니다. 정확한 복약 지도는 약사 또는 의사와 상담하세요."
"""
