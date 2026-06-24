"""SQLAlchemy ORM 모델 — pills 테이블."""

from __future__ import annotations

from sqlalchemy import Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class PillORM(Base):
    __tablename__ = "pills"

    item_seq: Mapped[str] = mapped_column(Text, primary_key=True)
    item_name: Mapped[str] = mapped_column(Text, nullable=False)
    entp_name: Mapped[str | None] = mapped_column(Text)
    is_otc: Mapped[bool | None] = mapped_column(Boolean)
    shape: Mapped[str | None] = mapped_column(Text)
    color_front: Mapped[str | None] = mapped_column(Text)
    color_back: Mapped[str | None] = mapped_column(Text)
    print_front: Mapped[str | None] = mapped_column(Text)
    print_back: Mapped[str | None] = mapped_column(Text)
    line_front: Mapped[str | None] = mapped_column(Text)
    line_back: Mapped[str | None] = mapped_column(Text)
    leng_long: Mapped[str | None] = mapped_column(Text)
    leng_short: Mapped[str | None] = mapped_column(Text)
    thick: Mapped[str | None] = mapped_column(Text)
    class_name: Mapped[str | None] = mapped_column(Text)
    form: Mapped[str | None] = mapped_column(Text)
    chart: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    efcy: Mapped[str | None] = mapped_column(Text)
    use_method: Mapped[str | None] = mapped_column(Text)
    caution: Mapped[str | None] = mapped_column(Text)
    raw_json: Mapped[dict | None] = mapped_column(JSONB)
    fetched_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
