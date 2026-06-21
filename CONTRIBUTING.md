# 협업 가이드 (Git이 처음인 팀원용)

이 문서만 그대로 따라 하면 됩니다. 모르겠으면 **혼자 해결하지 말고 팀 리드에게** 물어보세요.

## 0. 설치 (처음 한 번만)

1. [GitHub Desktop](https://desktop.github.com/) 설치 → GitHub 계정으로 로그인.
2. `File → Clone repository` → 우리 저장소(`Team-Seuk/pill_recognition`) 선택 → `Clone`.
3. 로컬 폴더가 생기면 준비 끝.

## 1. 매일 작업 루틴 (순서 그대로)

1. **Pull** — 상단 `Fetch origin` 눌러 `main` 최신화. (작업 시작 전 항상)
2. **브랜치 만들기** — `Current Branch → New Branch` → 이름은 `feat/내이름` 또는 `fix/내이름`. **`main`에서 분기**할 것.
3. **작업** — 코드 수정.
4. **Commit** — 변경 요약 적고 `Commit to feat/...`.
5. **Push** — `Push origin`(처음이면 `Publish branch`).
6. **Pull Request** — `Create Pull Request` → 내용 채우고 생성 → 리뷰 승인되면 `Merge`.
7. Merge 끝나면 **1번부터 다시**. (브랜치는 자동 삭제됨)

## 2. 절대 하지 말 것 (DO-NOT)

- ❌ **`main`에서 직접 작업/커밋** — 항상 브랜치를 만든다.
- ❌ **Force push** — 메뉴에 보여도 누르지 않는다. (히스토리가 날아간다)
- ❌ **`.env`·비밀키·API 키 커밋** — `.gitignore`가 막지만 직접 추가하지 말 것. (repo는 public이라 한 번 올리면 노출로 간주 → 즉시 키 폐기)
- ❌ **에러창에서 모르는 버튼 마구 누르기** — 멈추고 팀 리드 호출.

> 🔑 **키가 필요하면**: `backend/.env.example`을 `backend/.env`로 복사한 뒤 값을 채운다. 실제 키 값은 코드·PR·메신저 평문에 올리지 말고 팀 리드에게 받는다(비밀번호 관리자/DM).

## 3. 브랜치 이름 규칙

- 새 기능: `feat/<이름>` (예: `feat/login-form`)
- 버그 수정: `fix/<이름>` (예: `fix/camera-crash`)

## 4. 충돌(conflict)이 났다면

당황하지 말 것. **혼자 강제로 해결하지 말고** 팀 리드를 부른다. 잘못 누르면 남의 작업이 사라질 수 있다.

---

## 5. (팀 리드 전용) 저장소 1회 관리자 설정

> ✅ **적용 완료 (2026-06-21):** CODEOWNERS 역할 기반 설정 + `main` 브랜치 보호 켜짐
> (PR 필수 · 승인 1 · Code Owners 리뷰 · status check `backend`/`frontend` · force-push·삭제 차단).
> 아래는 기록·참고용. 팀장(@bestcow)은 admin이라 필요시 우회 가능.

아래는 처음 1회 설정이다. **순서 중요.**

1. GitHub에서 빈 저장소 생성(자동 README 끄기). 팀원 전원 collaborator(write) 추가.
2. `CODEOWNERS`를 역할 기반으로 채움: `/backend/`→@minahdev(BE) · `/frontend/`→@cloverky(FE) · 위험·설정·문서→@suvisdev(PL). PO(@bestcow)·SM(@woojeongalex)은 코드오너 아님.
3. **버리는 테스트 PR을 1개 먼저 연다** → `check` 워크플로가 한 번 돌아야 status check 이름(`backend`, `frontend`)이 등록된다.
4. `Settings → Branches → Add branch ruleset(또는 protection rule)` 로 `main` 보호:
   - ✅ Require a pull request before merging → **Required approvals: 1**
   - ✅ **Require review from Code Owners**
   - ✅ Require status checks to pass → **`backend`, `frontend` 선택** (3번 이후에야 목록에 뜸)
   - ✅ Block force pushes
5. `Settings → General → Pull Requests` → ✅ **Automatically delete head branches**.

> 함정: CI를 한 번도 안 돌린 상태(3번 생략)에서 4번을 하면 status check가 목록에 안 떠 선택할 수 없다. 반드시 3 → 4 순서.

## 6. 폴더·구조 변경 시 (삭제 권한 포함)

- **저장소(repo) 자체 삭제**: 팀원 불가. 조직 관리자/팀 리드만 가능.
- **파일·폴더 삭제·이동·이름변경**:
    - `main` 직접 push 불가 → 반드시 PR. (force push 차단)
    - **남의 담당(CODEOWNERS) 영역**을 바꾸는 PR은 **그 담당자 승인 없이 머지 안 됨** — 백엔드=@minahdev · 프론트=@cloverky · 위험·설정·문서=@suvisdev(PL).
    - **자기 역할 영역**(BE=`/backend/`, FE=`/frontend/`) 안에서는 자유롭게 추가·수정 가능. 단 본인이 유일한 코드오너라 **본인 PR은 본인이 승인 못 함** → 다른 코드오너가 없으면 팀장(@bestcow·admin)이 머지하거나 규칙을 완화한다.
    - 팀장(@bestcow, PO·admin)은 모든 영역을 수정할 수 있고 어떤 PR이든 우회 머지 가능(전권).
- **큰 구조 변경(폴더 이동·이름변경·삭제)은 충돌 위험이 크다.** 순서를 지킬 것:
    1. 다른 사람들이 자기 작업을 commit/push해 **깨끗할 때** 한다.
    2. PR로 `main`에 머지한다.
    3. 팀에 **"각자 commit/push 후 `git pull` 하라"** 고 공지한다.
- ⚠️ 위 잠금(삭제·승인 게이트)은 **branch protection이 켜져야 실제로 작동**한다.
