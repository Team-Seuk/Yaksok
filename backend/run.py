"""대체 실행 진입점: backend/ 에서 ``python run.py`` 로 개발 서버 기동.

uvicorn CLI 대신 코드로 띄우고 싶을 때 사용한다.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
