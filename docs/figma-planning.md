# Figma 기획서 작성 및 반영 가이드

사용자별(Student → Master → Admin) 기획서를 Figma에 반영하기 위한 방법과 산출물 설명입니다.

## 기획서 구성

- **스크린샷**: 역할별 화면 캡처 (기존 `screenshots/` 폴더 활용)
- **기능 정의**: 메뉴·라우트·페이지(컴포넌트) 기준 기능 목록
- **데이터 정의**: 각 역할의 주요 엔티티·필드·출처(타입/ Mock/ API)
- **사용자 워크플로우**: 역할별 대표 시나리오(화면·액션 순서)

## Figma 기획서 파일

- **파일**: [medicrew-new](https://www.figma.com/design/oU6nx53PJj3Q809xZDsBrF/medicrew-new)
- **파일 키**: `oU6nx53PJj3Q809xZDsBrF` (스크립트로 요약 코멘트 추가 시 사용)

위 파일에 기획서 내용(스크린샷·기능 정의·데이터 정의·워크플로우)을 `docs/planning-report.html` 을 참고해 반영하면 됩니다.

## 산출물

| 파일 | 설명 |
|------|------|
| [docs/planning-spec.json](planning-spec.json) | 기획서 스펙 (역할별 스크린샷·기능·데이터·워크플로우) |
| [docs/planning-report.html](planning-report.html) | 스펙 기반 HTML 리포트 (브라우저에서 열어 참고) |
| [docs/figma-structure.json](figma-structure.json) | Figma 프레임 구조 참고용 JSON |
| [docs/planning-spec-detail.md](planning-spec-detail.md) | **스크린샷별 상세 정의** (액션, 필터, 검색, 테이블 표시 데이터, 통계 산출식) |
| [scripts/create-figma-planning.mjs](../scripts/create-figma-planning.mjs) | 스펙 → HTML/JSON 생성 스크립트 |

## 실행 방법

### 1. 기획서 리포트 생성

스펙이 수정된 뒤 리포트를 다시 만들 때:

```bash
node scripts/create-figma-planning.mjs
```

- `docs/planning-report.html`, `docs/figma-structure.json` 이 갱신됩니다.
- HTML은 프로젝트 루트 기준 `../screenshots/...` 로 이미지를 참조하므로, **브라우저에서 `docs/planning-report.html` 을 열 때는 파일 경로가 `file:///.../web-service/docs/planning-report.html` 이어야** 스크린샷이 보입니다. (같은 프로젝트 내에서 열기)

### 2. Figma에 반영 (수동)

Figma REST API는 **새 파일 생성·노드 생성**을 지원하지 않습니다. 아래 중 하나로 반영합니다.

1. **새 파일 생성**: [figma.com/new](https://figma.com/new) 에서 새 디자인 파일 생성
2. **기획서 구조 반영**:
   - 페이지 1에 프레임 3개: `1. Student`, `2. Master`, `3. Admin`
   - 각 프레임 안에 섹션: 스크린샷(이미지), 기능 정의(텍스트), 데이터 정의(텍스트), 사용자 워크플로우(텍스트)
3. **스크린샷 채우기**: `docs/planning-report.html` 을 브라우저로 열어 참고하면서, `screenshots/` 폴더의 PNG를 Figma 캔버스로 드래그하거나, Figma Plugin(이미지 일괄 업로드 등)으로 배치

### 3. (선택) 기존 Figma 파일에 요약 코멘트 추가

이미 만든 Figma 파일에 기획서 요약을 코멘트로 남기려면:

1. [Figma 설정](https://www.figma.com/settings) → "Personal access tokens"에서 토큰 생성
2. 환경 변수 설정 후 스크립트 실행:

```bash
FIGMA_TOKEN=your-token FIGMA_FILE_KEY=oU6nx53PJj3Q809xZDsBrF node scripts/create-figma-planning.mjs
```

- `FIGMA_FILE_KEY`: medicrew-new 파일 키는 `oU6nx53PJj3Q809xZDsBrF` (URL의 `.../design/XXXXXXXX` 부분)
- 스크립트가 해당 파일에 기획서 요약 코멘트 1개를 추가합니다.

## 기획서 작성 방법 (스펙 수정 시)

- **스크린샷**: `docs/planning-spec.json` 의 `roles[].screenshots` 에 `path`(screenshots/ 하위 경로), `name`(화면명) 추가
- **기능 정의**: `roles[].features` 에 `name`, `path`, `component`, `description` 추가 (메뉴/라우트는 [menuConfig.ts](../my-app/src/config/menuConfig.ts), [student/master/adminRoutes](../my-app/src/routes/config/) 참고)
- **데이터 정의**: `roles[].data` 에 `entity`, `fields`, `source` 추가 (타입·Mock은 페이지/데이터 파일 참고)
- **사용자 워크플로우**: `roles[].workflows` 에 `name`, `steps`(배열) 추가

스펙 수정 후 `node scripts/create-figma-planning.mjs` 를 다시 실행하면 HTML/JSON이 갱신됩니다.
