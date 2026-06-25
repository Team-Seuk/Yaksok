"""pill 도메인 v1 라우터 묶음 (식별 + 알약사전 조회).

main.py 에서 ``from apps.pill.adapter.inbound.api.v1 import router as pill_router``
→ ``app.include_router(pill_router, prefix="/api")`` 로 등록한다.
각 기능 라우터(identify·dictionary)가 자기 ``/pill`` prefix 를 들고 있고, 여기서
하나로 묶어 노출한다 → main.py 는 그대로(공용구역 미변경).
"""

from __future__ import annotations

from fastapi import APIRouter

from .dictionary import router as dictionary_router
from .identify import router as identify_router

router = APIRouter()
router.include_router(identify_router)
router.include_router(dictionary_router)

__all__ = ["router"]
