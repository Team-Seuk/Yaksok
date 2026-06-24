"""``POST /api/pill/identify`` 응답 스키마 (pydantic).

요청은 multipart 파일이라 본문 스키마가 없다(라우터의 UploadFile 파라미터).
응답은 use_case 의 IdentifyResult(Vision 속성 + P2 매칭 후보)를 직렬화 형태로 변환.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from apps.pill.app.dtos.identify import IdentifyResult


class AttributesSchema(BaseModel):
    """Vision 이 추출한 식별 속성(식약처 표기)."""

    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    imprint_front: str | None = None
    imprint_back: str | None = None
    line_front: str | None = None
    line_back: str | None = None
    form: str | None = None


class CandidateSchema(BaseModel):
    """매칭 후보 약 한 건 (P2 PillCandidate 그대로). ``score`` 는 높을수록 일치."""

    item_seq: str
    item_name: str
    entp_name: str | None = None
    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    print_front: str | None = None
    print_back: str | None = None
    image_url: str | None = None
    is_otc: bool | None = None
    score: float


class IdentifyResponse(BaseModel):
    attributes: AttributesSchema
    candidates: list[CandidateSchema] = Field(default_factory=list)
    needs_retry: bool = Field(
        description="후보 0개이거나 최고 점수가 낮아 재촬영을 권하는지 여부",
    )
    message: str | None = Field(default=None, description="재촬영 안내 등 사용자에게 보여줄 메시지")

    @classmethod
    def from_result(cls, result: IdentifyResult, *, min_score: float) -> IdentifyResponse:
        attrs = result.attributes
        top = max((c.score for c in result.candidates), default=0.0)
        needs_retry = not result.candidates or top < min_score
        return cls(
            attributes=AttributesSchema(
                shape=attrs.shape.value if attrs.shape else None,
                color_front=attrs.color_front.value if attrs.color_front else None,
                color_back=attrs.color_back.value if attrs.color_back else None,
                imprint_front=attrs.imprint_front,
                imprint_back=attrs.imprint_back,
                line_front=attrs.line_front.value if attrs.line_front else None,
                line_back=attrs.line_back.value if attrs.line_back else None,
                form=attrs.form.value if attrs.form else None,
            ),
            candidates=[
                CandidateSchema(
                    item_seq=c.item_seq,
                    item_name=c.item_name,
                    entp_name=c.entp_name,
                    shape=c.shape,
                    color_front=c.color_front,
                    color_back=c.color_back,
                    print_front=c.print_front,
                    print_back=c.print_back,
                    image_url=c.image_url,
                    is_otc=c.is_otc,
                    score=c.score,
                )
                for c in result.candidates
            ],
            needs_retry=needs_retry,
            message="알약이 잘 보이도록 다시 촬영해 주세요." if needs_retry else None,
        )
