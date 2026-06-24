"""DB 엔진·세션·Base. SQLAlchemy 2.0 (동기), 드라이버 psycopg(v3).

엔진 생성은 지연 연결이라 import 시점에 DB가 없어도 서버는 뜬다.
실제 쿼리 시점에 연결한다.

도메인 ORM 모델은 각 도메인의 ``apps/<도메인>/adapter/outbound/orm/`` 에 두고
여기의 :class:`Base` 를 상속한다. (계약상 ``apps`` 는 ``core`` 를 import 할 수 있다.)
FastAPI 라우터에서는 ``db: Session = Depends(get_db)`` 로 세션을 주입받는다.
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from core.config import get_settings

engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """모든 ORM 모델의 공통 베이스."""


def get_db() -> Iterator[Session]:
    """요청당 세션을 열고 끝나면 닫는 FastAPI 의존성."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
