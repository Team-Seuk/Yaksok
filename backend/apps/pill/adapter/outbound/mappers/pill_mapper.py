"""ORM ↔ 도메인 엔티티 변환."""

from __future__ import annotations

from apps.pill.adapter.outbound.orm.pill_orm import PillORM
from apps.pill.domain.entities.pill import Pill


def orm_to_domain(row: PillORM) -> Pill:
    return Pill(
        item_seq=row.item_seq,
        item_name=row.item_name,
        entp_name=row.entp_name,
        is_otc=row.is_otc,
        shape=row.shape,
        color_front=row.color_front,
        color_back=row.color_back,
        print_front=row.print_front,
        print_back=row.print_back,
        line_front=row.line_front,
        line_back=row.line_back,
        leng_long=row.leng_long,
        leng_short=row.leng_short,
        thick=row.thick,
        class_name=row.class_name,
        form=row.form,
        chart=row.chart,
        image_url=row.image_url,
        efcy=row.efcy,
        use_method=row.use_method,
        caution=row.caution,
        extra=row.raw_json or {},
    )


def domain_to_orm(pill: Pill) -> PillORM:
    return PillORM(
        item_seq=pill.item_seq,
        item_name=pill.item_name,
        entp_name=pill.entp_name,
        is_otc=pill.is_otc,
        shape=pill.shape,
        color_front=pill.color_front,
        color_back=pill.color_back,
        print_front=pill.print_front,
        print_back=pill.print_back,
        line_front=pill.line_front,
        line_back=pill.line_back,
        leng_long=pill.leng_long,
        leng_short=pill.leng_short,
        thick=pill.thick,
        class_name=pill.class_name,
        form=pill.form,
        chart=pill.chart,
        image_url=pill.image_url,
        efcy=pill.efcy,
        use_method=pill.use_method,
        caution=pill.caution,
        raw_json=pill.extra or None,
    )
