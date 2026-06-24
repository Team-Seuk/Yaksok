"""``POST /api/pill/identify`` — 알약 사진 업로드 → 속성 추출 + 후보 약.

이미지는 식별에만 쓰고 **서버에 저장하지 않는다**(ERD 결정: vision 속성만 보관).
유스케이스는 DI(``get_identify_use_case``)로 주입받아 Vision/매칭 구현을 모른다.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from apps.pill.adapter.inbound.api.schemas.identify import IdentifyResponse
from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.dependencies import get_identify_use_case

router = APIRouter(prefix="/pill", tags=["pill"])

# 업로드 이미지 제약.
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
_MAX_BYTES = 8 * 1024 * 1024  # 8MB
_MIN_CONFIDENCE = 0.3  # 이 미만이면 재촬영 안내


@router.post("/identify", response_model=IdentifyResponse)
async def identify_pill(
    file: Annotated[UploadFile, File(description="알약 사진 1장 (jpeg/png/webp, ≤8MB)")],
    use_case: Annotated[IdentifyPillPort, Depends(get_identify_use_case)],
) -> IdentifyResponse:
    mime = file.content_type or ""
    if mime not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"지원하지 않는 이미지 형식입니다: {mime or '알 수 없음'} (jpeg/png/webp만 허용)",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="빈 이미지입니다.")
    if len(image_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="이미지가 너무 큽니다(최대 8MB).",
        )

    # 사진은 식별에만 사용하고 저장하지 않는다.
    result = use_case.execute(image_bytes, mime)
    return IdentifyResponse.from_result(result, min_confidence=_MIN_CONFIDENCE)
