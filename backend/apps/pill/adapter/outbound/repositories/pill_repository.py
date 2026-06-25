"""PillRepository — SQLAlchemy 구현.

매칭 스코어링 로직:
  - 각인(앞/뒤) 완전일치: +5.0 each  (가장 강한 식별자 — 모양+색 전부보다 우선)
  - 모양 완전일치: +2.0
  - 색(앞) 완전일치: +1.5
  - 색(뒤) 완전일치: +1.0
  - 분할선(앞/뒤) 완전일치: +0.5 each
  값이 None이면 해당 항목 점수 제외(모르는 속성은 감점 없음).
  각인은 정규화(공백 제거·대문자) 후 비교.
"""

from __future__ import annotations

import re

from sqlalchemy import func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import InstrumentedAttribute, Session
from sqlalchemy.sql.elements import ColumnElement

from apps.pill.adapter.outbound.mappers.pill_mapper import domain_to_orm, orm_to_domain
from apps.pill.adapter.outbound.orm.pill_orm import PillORM
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate


def _normalize_print(val: str | None) -> str:
    """각인 비교용 정규화: 공백·하이픈 제거, 대문자."""
    if val is None:
        return ""
    return re.sub(r"[\s\-]", "", val).upper()


def _normalize_print_sql(col: InstrumentedAttribute[str | None]) -> ColumnElement[str]:
    """1차 필터용 — _normalize_print 와 동일 정규화를 SQL 표현식으로(공백·하이픈 제거, 대문자)."""
    return func.upper(func.replace(func.replace(func.replace(col, " ", ""), "\t", ""), "-", ""))


def _score(row: PillORM, attrs: PillAttrs) -> float:
    s = 0.0
    if attrs.print_front is not None and (
        _normalize_print(row.print_front) == _normalize_print(attrs.print_front)
    ):
        s += 5.0
    if attrs.print_back is not None and (
        _normalize_print(row.print_back) == _normalize_print(attrs.print_back)
    ):
        s += 5.0
    if attrs.shape is not None and row.shape == attrs.shape:
        s += 2.0
    if attrs.color_front is not None and row.color_front == attrs.color_front:
        s += 1.5
    if attrs.color_back is not None and row.color_back == attrs.color_back:
        s += 1.0
    if attrs.line_front is not None and row.line_front == attrs.line_front:
        s += 0.5
    if attrs.line_back is not None and row.line_back == attrs.line_back:
        s += 0.5
    return s


class PillRepository(PillRepositoryPort):
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_seq(self, item_seq: str) -> Pill | None:
        row = self._db.get(PillORM, item_seq)
        return orm_to_domain(row) if row else None

    def search(self, keyword: str, limit: int = 20) -> list[Pill]:
        kw = f"%{keyword}%"
        stmt = (
            select(PillORM)
            .where(or_(PillORM.item_name.ilike(kw), PillORM.class_name.ilike(kw)))
            .limit(limit)
        )
        return [orm_to_domain(r) for r in self._db.scalars(stmt)]

    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]:
        """속성 조건으로 1차 필터 후 스코어링, 상위 N 반환."""
        conditions = []
        if attrs.shape:
            conditions.append(PillORM.shape == attrs.shape)
        if attrs.color_front:
            conditions.append(PillORM.color_front == attrs.color_front)
        if attrs.color_back:
            conditions.append(PillORM.color_back == attrs.color_back)
        # 각인은 가장 강한 식별자 — 모양·색을 Vision이 틀리게 읽어도
        # 각인이 맞으면 후보에서 탈락하지 않도록 1차 필터에 포함(정규화 후 비교).
        if attrs.print_front:
            conditions.append(
                _normalize_print_sql(PillORM.print_front) == _normalize_print(attrs.print_front)
            )
        if attrs.print_back:
            conditions.append(
                _normalize_print_sql(PillORM.print_back) == _normalize_print(attrs.print_back)
            )

        stmt = select(PillORM)
        if conditions:
            # 조건 하나라도 맞는 행을 후보로 (OR — 색이 틀려도 각인 맞으면 포함)
            stmt = stmt.where(or_(*conditions))

        rows = list(self._db.scalars(stmt))

        # 동점 tie-break: 점수 내림차순 후 item_seq 오름차순으로 결정적 정렬
        # (색만 맞아 같은 점수로 묶이는 잡음 약 사이에서 순서가 흔들리지 않게).
        scored = sorted(
            ((row, _score(row, attrs)) for row in rows),
            key=lambda x: (-x[1], x[0].item_seq),
        )

        return [
            PillCandidate(
                item_seq=row.item_seq,
                item_name=row.item_name,
                entp_name=row.entp_name,
                shape=row.shape,
                color_front=row.color_front,
                color_back=row.color_back,
                print_front=row.print_front,
                print_back=row.print_back,
                image_url=row.image_url,
                is_otc=row.is_otc,
                score=score,
            )
            for row, score in scored[:limit]
            if score > 0
        ]

    def upsert(self, pill: Pill) -> None:
        orm = domain_to_orm(pill)
        stmt = (
            pg_insert(PillORM)
            .values(
                item_seq=orm.item_seq,
                item_name=orm.item_name,
                entp_name=orm.entp_name,
                is_otc=orm.is_otc,
                shape=orm.shape,
                color_front=orm.color_front,
                color_back=orm.color_back,
                print_front=orm.print_front,
                print_back=orm.print_back,
                line_front=orm.line_front,
                line_back=orm.line_back,
                leng_long=orm.leng_long,
                leng_short=orm.leng_short,
                thick=orm.thick,
                class_name=orm.class_name,
                form=orm.form,
                chart=orm.chart,
                image_url=orm.image_url,
                efcy=orm.efcy,
                use_method=orm.use_method,
                caution=orm.caution,
                raw_json=orm.raw_json,
            )
            .on_conflict_do_update(
                index_elements=["item_seq"],
                set_={
                    "item_name": orm.item_name,
                    "entp_name": orm.entp_name,
                    "is_otc": orm.is_otc,
                    "shape": orm.shape,
                    "color_front": orm.color_front,
                    "color_back": orm.color_back,
                    "print_front": orm.print_front,
                    "print_back": orm.print_back,
                    "line_front": orm.line_front,
                    "line_back": orm.line_back,
                    "leng_long": orm.leng_long,
                    "leng_short": orm.leng_short,
                    "thick": orm.thick,
                    "class_name": orm.class_name,
                    "form": orm.form,
                    "chart": orm.chart,
                    "image_url": orm.image_url,
                    "efcy": orm.efcy,
                    "use_method": orm.use_method,
                    "caution": orm.caution,
                    "raw_json": orm.raw_json,
                },
            )
        )
        self._db.execute(stmt)
        self._db.commit()

    def upsert_many(self, pills: list[Pill]) -> None:
        if not pills:
            return
        orms = [domain_to_orm(p) for p in pills]
        rows = [
            {
                "item_seq": o.item_seq,
                "item_name": o.item_name,
                "entp_name": o.entp_name,
                "is_otc": o.is_otc,
                "shape": o.shape,
                "color_front": o.color_front,
                "color_back": o.color_back,
                "print_front": o.print_front,
                "print_back": o.print_back,
                "line_front": o.line_front,
                "line_back": o.line_back,
                "leng_long": o.leng_long,
                "leng_short": o.leng_short,
                "thick": o.thick,
                "class_name": o.class_name,
                "form": o.form,
                "chart": o.chart,
                "image_url": o.image_url,
                "efcy": o.efcy,
                "use_method": o.use_method,
                "caution": o.caution,
                "raw_json": o.raw_json,
            }
            for o in orms
        ]
        # 같은 item_seq 가 한 statement 안에 중복되면 ON CONFLICT 가 실패하므로 마지막 값만 남긴다.
        rows = list({r["item_seq"]: r for r in rows}.values())
        # psycopg 파라미터 한계(65535). 행당 컬럼 수가 있어 전량을 한 번에 보내면 초과하므로
        # 청크로 나눠 INSERT 한다 (1000행 × ~22컬럼 ≈ 22,000 파라미터).
        chunk_size = 1000
        for start in range(0, len(rows), chunk_size):
            batch = rows[start : start + chunk_size]
            stmt = (
                pg_insert(PillORM)
                .values(batch)
                .on_conflict_do_update(
                    index_elements=["item_seq"],
                    set_={
                        col: pg_insert(PillORM).excluded[col]
                        for col in batch[0]
                        if col != "item_seq"
                    },
                )
            )
            self._db.execute(stmt)
        self._db.commit()
