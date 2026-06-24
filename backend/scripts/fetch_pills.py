"""의약품 낱알식별 정보(공공데이터포털 오픈API) 전량 수집 → DB 적재 + 프런트 정적 JSON 생성.

준비:
  1) https://www.data.go.kr/data/15057639/openapi.do 에서 활용신청(즉시 자동승인)
  2) 마이페이지 → '인코딩(Encoding) 인증키' 복사  (URL 인코딩된 키를 그대로 씀)
  3) backend/.env 에  DATA_GO_KR_KEY=<인코딩 인증키>  추가

실행 (backend/ 디렉터리에서):
  uv run python scripts/fetch_pills.py           # DB 적재 + JSON 생성
  uv run python scripts/fetch_pills.py --json-only  # JSON만(DB 연결 없이)

엔드포인트가 바뀌어 에러가 나면 환경변수로 교체 가능:
  MDCIN_API_URL=...getMdcinGrnIdntfcInfoList03  uv run python scripts/fetch_pills.py
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
OUT_PATH = BACKEND_DIR.parent / "frontend" / "public" / "data" / "pills.json"

API_URL = os.environ.get(
    "MDCIN_API_URL",
    "http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01",
)
NUM_OF_ROWS = 100

# 응답(UPPER_SNAKE) → 우리 필드(camelCase/snake) 매핑. 필요한 것만 추린다.
FIELDS: dict[str, str] = {
    "ITEM_SEQ": "itemSeq",
    "ITEM_NAME": "name",
    "ENTP_NAME": "entp",
    "DRUG_SHAPE": "shape",
    "COLOR_CLASS1": "colorFront",
    "COLOR_CLASS2": "colorBack",
    "PRINT_FRONT": "printFront",
    "PRINT_BACK": "printBack",
    "LINE_FRONT": "lineFront",
    "LINE_BACK": "lineBack",
    "LENG_LONG": "lengLong",
    "LENG_SHORT": "lengShort",
    "THICK": "thick",
    "CLASS_NAME": "className",
    "ETC_OTC_NAME": "etcOtc",
    "FORM_CODE_NAME": "form",
    "CHART": "chart",
    "ITEM_IMAGE": "image",
}


def load_key() -> str:
    env = BACKEND_DIR / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if stripped.startswith("DATA_GO_KR_KEY="):
                return stripped.split("=", 1)[1].strip()
    return os.environ.get("DATA_GO_KR_KEY", "")


def fetch_page(key: str, page: int) -> dict[str, Any]:
    query = urllib.parse.urlencode({"pageNo": page, "numOfRows": NUM_OF_ROWS, "type": "json"})
    url = f"{API_URL}?serviceKey={key}&{query}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    try:
        data: Any = json.loads(raw)
    except json.JSONDecodeError:
        print("JSON 파싱 실패 — 응답이 XML일 수 있음:")
        print(raw[:500])
        raise
    body = data.get("body") or data.get("response", {}).get("body")
    if body is None:
        print("예상치 못한 응답 구조:")
        print(raw[:500])
        raise SystemExit(1)
    return body


def collect(body: dict[str, Any], out: list[dict[str, Any]]) -> None:
    items = body.get("items") or []
    if isinstance(items, dict):
        items = [items]
    out.extend({dst: it.get(src) for src, dst in FIELDS.items()} for it in items)


def _to_pill(rec: dict[str, Any]):  # type: ignore[return]
    """JSON 레코드 → Pill 도메인 엔티티."""
    # 로컬 import — 스크립트 단독 실행 시에도 경로가 맞아야 함
    sys.path.insert(0, str(BACKEND_DIR))
    from apps.pill.domain.entities.pill import Pill

    return Pill(
        item_seq=rec.get("itemSeq") or "",
        item_name=rec.get("name") or "",
        entp_name=rec.get("entp"),
        is_otc=rec.get("etcOtc") == "일반의약품",
        shape=rec.get("shape"),
        color_front=rec.get("colorFront"),
        color_back=rec.get("colorBack"),
        print_front=rec.get("printFront"),
        print_back=rec.get("printBack"),
        line_front=rec.get("lineFront"),
        line_back=rec.get("lineBack"),
        leng_long=rec.get("lengLong"),
        leng_short=rec.get("lengShort"),
        thick=rec.get("thick"),
        class_name=rec.get("className"),
        form=rec.get("form"),
        chart=rec.get("chart"),
        image_url=rec.get("image"),
    )


def save_to_db(records: list[dict[str, Any]]) -> None:
    """수집한 레코드를 pills 테이블에 upsert."""
    sys.path.insert(0, str(BACKEND_DIR))
    from apps.pill.adapter.outbound.repositories.pill_repository import PillRepository
    from core.db import SessionLocal

    pills = [_to_pill(r) for r in records if r.get("itemSeq")]
    with SessionLocal() as db:
        repo = PillRepository(db)
        repo.upsert_many(pills)
    print(f"DB 적재 완료: {len(pills)}건")


def main() -> None:
    json_only = "--json-only" in sys.argv

    key = load_key()
    if not key:
        raise SystemExit("backend/.env 의 DATA_GO_KR_KEY 가 비어 있음.")

    first = fetch_page(key, 1)
    total = int(first.get("totalCount", 0))
    if total == 0:
        print("totalCount=0 — 인증키/엔드포인트를 확인하세요.")
        return
    print(f"총 {total}건 수집 시작 (페이지당 {NUM_OF_ROWS})")

    records: list[dict[str, Any]] = []
    collect(first, records)

    pages = (total + NUM_OF_ROWS - 1) // NUM_OF_ROWS
    for page in range(2, pages + 1):
        collect(fetch_page(key, page), records)
        if page % 10 == 0:
            print(f"  {len(records)}/{total}")
        time.sleep(0.1)

    # JSON 생성
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False), encoding="utf-8")
    print(f"JSON 완료: {len(records)}건 → {OUT_PATH}")

    # DB 적재
    if not json_only:
        save_to_db(records)


if __name__ == "__main__":
    main()
