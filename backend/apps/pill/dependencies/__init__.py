"""pill 도메인 조립 루트(DI).

provider를 책임별 파일로 분리하고 여기서 모아 re-export한다 —
``from apps.pill.dependencies import get_identify_use_case`` 경로는 그대로 유지.

- [vision](vision.py): Vision 구현 선택(키 기반)
- [repository](repository.py): P2 매칭 리포지토리(DB 세션)
- [use_cases](use_cases.py): 위 포트들을 조립해 유스케이스 생성
"""

from apps.pill.dependencies.repository import get_pill_repo
from apps.pill.dependencies.use_cases import get_identify_use_case
from apps.pill.dependencies.vision import get_vision_port

__all__ = ["get_identify_use_case", "get_pill_repo", "get_vision_port"]
