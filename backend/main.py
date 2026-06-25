"""FastAPI 진입점. backend/ 에서 ``uvicorn main:app --reload`` 로 실행.

도메인 라우터는 각 ``apps/<도메인>/adapter/inbound/api/v1`` 에 정의한 뒤
여기서 ``app.include_router(...)`` 로 등록한다(의존성 방향 adapter → app → domain).
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.db import Base, engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """기동 시 테이블을 보장한다(Alembic 도입 전 임시).

    ORM 모델 모듈을 import 해야 ``Base.metadata`` 에 테이블이 등록된다.
    DB 미기동이어도 서버는 뜨고(쿼리 시점에 실패), 연결되면 자동 생성된다.
    """
    from apps.guidance.adapter.outbound.orm import models as _guidance_orm  # noqa: F401
    from apps.pill.adapter.outbound.orm import pill_orm as _pill_orm  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:  # noqa: BLE001 — DB 없이도 기동 보장
        logger.warning("DB 테이블 생성 건너뜀 (DB 미연결?): %s", exc)
    yield


app = FastAPI(title="Yaksok", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev 서버
        "http://127.0.0.1:5173",
        "https://seuk.cloud",
        "https://www.seuk.cloud",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# 도메인 라우터 등록 (각 라우터가 자기 prefix 를 들고 있다).
from apps.guidance.adapter.inbound.api.v1 import router as guidance_router  # noqa: E402
from apps.pill.adapter.inbound.api.v1 import router as pill_router  # noqa: E402

app.include_router(guidance_router)  # prefix=/api/guidance (라우터 내부)
app.include_router(pill_router, prefix="/api")  # → /api/pill/...
