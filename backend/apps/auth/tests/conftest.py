"""auth 도메인 테스트 공통 설정.

backend/ 를 sys.path 에 올려 cwd 와 무관하게 ``apps.*`` / ``core.*`` 임포트가 되게 한다.
공통 픽스처도 여기에 둔다(DB 불필요한 단위 테스트 기준).
"""

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[3]  # apps/auth/tests/ → backend/
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))
