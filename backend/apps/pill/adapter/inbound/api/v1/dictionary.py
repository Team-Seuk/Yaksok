"""알약사전 조회 API — 검색·목록·상세 (GET).

- ``GET /api/pill/dictionary?q=&limit=`` — 키워드 검색(비면 전체 목록)
- ``GET /api/pill/dictionary/{item_seq}`` — 품목기준코드로 상세 1건

identify 와 같은 pill 라우터에 합쳐진다(`v1/__init__.py`). use_case 는 DI 주입.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from apps.pill.app.dtos.pill_dto import PillDetail, SearchRequest
from apps.pill.app.ports.input.search_pills_port import SearchPillsPort
from apps.pill.dependencies import get_search_pills_use_case

router = APIRouter(prefix="/pill", tags=["pill-dictionary"])

_MAX_LIMIT = 100


class PillSummarySchema(BaseModel):
    """목록용 요약 필드."""

    item_seq: str
    item_name: str
    entp_name: str | None = None
    is_otc: bool | None = None
    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    class_name: str | None = None
    image_url: str | None = None

    @classmethod
    def from_dto(cls, d: PillDetail) -> PillSummarySchema:
        return cls(
            item_seq=d.item_seq,
            item_name=d.item_name,
            entp_name=d.entp_name,
            is_otc=d.is_otc,
            shape=d.shape,
            color_front=d.color_front,
            color_back=d.color_back,
            class_name=d.class_name,
            image_url=d.image_url,
        )


class PillDetailSchema(PillSummarySchema):
    """상세용 — 요약 + 각인·제형·효능·용법·주의사항."""

    print_front: str | None = None
    print_back: str | None = None
    form: str | None = None
    efcy: str | None = None
    use_method: str | None = None
    caution: str | None = None

    @classmethod
    def from_dto(cls, d: PillDetail) -> PillDetailSchema:
        return cls(
            item_seq=d.item_seq,
            item_name=d.item_name,
            entp_name=d.entp_name,
            is_otc=d.is_otc,
            shape=d.shape,
            color_front=d.color_front,
            color_back=d.color_back,
            class_name=d.class_name,
            image_url=d.image_url,
            print_front=d.print_front,
            print_back=d.print_back,
            form=d.form,
            efcy=d.efcy,
            use_method=d.use_method,
            caution=d.caution,
        )


@router.get("/dictionary", response_model=list[PillSummarySchema])
def list_pills(
    use_case: Annotated[SearchPillsPort, Depends(get_search_pills_use_case)],
    q: Annotated[str, Query(description="약 이름/분류 검색어 (비우면 전체)")] = "",
    limit: Annotated[int, Query(ge=1, le=_MAX_LIMIT)] = 30,
) -> list[PillSummarySchema]:
    results = use_case.search(SearchRequest(keyword=q, limit=limit))
    return [PillSummarySchema.from_dto(r) for r in results]


@router.get("/dictionary/{item_seq}", response_model=PillDetailSchema)
def get_pill(
    item_seq: str,
    use_case: Annotated[SearchPillsPort, Depends(get_search_pills_use_case)],
) -> PillDetailSchema:
    detail = use_case.get_detail(item_seq)
    if detail is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"해당 약을 찾을 수 없습니다: {item_seq}",
        )
    return PillDetailSchema.from_dto(detail)
