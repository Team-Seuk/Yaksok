# pill_recognition

> 소개·실행법·환경변수. 의사결정·범위는 PLAN. (CONVENTIONS §6)

알약을 카메라로 비추면 개인 건강정보·현재 시각에 맞춰 LLM이 용법·주의사항을 안내하는 반응형 웹 앱.

## 실행

### Backend (FastAPI · Python 3.11+)

```
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

확인: http://127.0.0.1:8000/health → `{"status":"ok"}`

### Frontend (React · TypeScript · Vite)

```
cd frontend
npm install
npm run dev
```

확인: http://localhost:5173

## 환경변수

`.env`는 **절대 커밋하지 않는다** (`.gitignore`가 차단). 샘플 값은 `.env.example`에 둔다.

향후 필요(예정): 백엔드 `backend/.env`에 `ANTHROPIC_API_KEY`(Claude), 공공데이터포털 인증키(낱알식별·DUR·e약은요). 확정 시 표로 정리.

---

🧑‍💻 **Git이 처음이라면 [CONTRIBUTING.md](CONTRIBUTING.md)를 먼저 읽으세요.**
