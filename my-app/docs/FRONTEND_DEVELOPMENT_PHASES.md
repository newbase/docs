# 프론트엔드 개발 Phase별 정리

**기준**: 백엔드 API 정보(`docs/api/API.md`, `openapi.json`) + 디자인·페이지 업데이트  
**참고**: `.agent/rules/ux-design-ruleset.md`, `.github/BACKLOG.md`

---

## Phase 1: 백엔드 스펙 반영 및 API 계층 정합성

**목표**: OpenAPI/API.md와 프론트 타입·서비스·훅이 일치하도록 맞추고, 새/변경 API를 반영한다.

| 순서 | 작업 | 참고 위치 | 산출물 |
|------|------|-----------|--------|
| 1.1 | **openapi.json → 타입/서비스 동기화** | `docs/api/openapi.json`, `src/types/api/*.d.ts` | 요청/응답 DTO 타입이 스펙과 일치하는지 점검·수정 |
| 1.2 | **인증·유저 API** | API.md §1 인증, §2 유저 | `authService.ts`, `userServiceApi.ts`, `useAuth`, `useUser` 요청 필드(loginId/password 등) 및 에러 코드(404/409) 처리 |
| 1.3 | **공통 파라미터 규칙** | API.md (page, pageSize, search 등) | 리스트 API 호출 시 쿼리 파라미터 네이밍·필수값이 백엔드와 동일한지 확인 |
| 1.4 | **신규/변경 엔드포인트 반영** | API.md, BACKLOG 미완료 항목 | 디바이스(`/device/*`), 시나리오 플레이 기록(`/scenario-play-record`) 등 필요한 API 함수·타입 추가 |

**완료 기준**:  
- 로그인/회원가입 등 주요 API가 스펙과 동일한 필드·에러로 동작  
- 새로 쓰는 API는 `apiClient` + 타입 + (필요 시) 훅으로 일관되게 추가됨  

---

## Phase 2: 디자인·페이지 반영 (UX 룰셋 준수)

**목표**: 디자인 업데이트(페이지 추가·수정)를 반영하고, UX 룰셋(공유 컴포넌트·스타일·접근성)을 따른다.

| 순서 | 작업 | 참고 위치 | 산출물 |
|------|------|-----------|--------|
| 2.1 | **새 페이지 추가** | 디자인/기획서, 라우트 설정 | `src/pages/**`, `routes/config/*.ts` 에 라우트·메뉴 추가, `PageHeader` 사용 |
| 2.2 | **기존 페이지 수정** | 디자인 시안, ux-design-ruleset | 레이아웃·간격·카드/버튼 패턴을 룰셋에 맞게 수정 |
| 2.3 | **공유 컴포넌트 우선 사용** | `src/components/shared/ui`, `styles/ui.css` | 새 UI는 공유 컴포넌트·기존 클래스 확인 후 추가, 인라인 스타일 금지(동적 값 제외) |
| 2.4 | **반응형·접근성** | ux-design-ruleset (체크리스트) | 터치 타겟 44x44px, 색상 대비, 키보드/ARIA, `focus:ring` 등 점검 |

**완료 기준**:  
- 새/수정 페이지가 룰셋 체크리스트를 만족  
- `styles/ui.css`, `pages.css`·Tailwind 우선 사용, 중복 스타일 없음  

---

## Phase 3: 기능 단위 API 연동 및 에러 처리

**목표**: Feature별로 백엔드 API와 실제 연동을 완료하고, 에러·엣지 케이스를 처리한다.

| 순서 | 작업 | 참고 위치 | 산출물 |
|------|------|-----------|--------|
| 3.1 | **대시보드** | BACKLOG Feature 2, API.md | 학생/마스터/Admin 대시보드용 API 엔드포인트 확인 후 연동(또는 Mock 유지 시 문서화) |
| 3.2 | **시나리오 관리** | BACKLOG Feature 4, API.md §3 | `scenarioService` — 목록/상세/생성 등 `GET /scenario/list`, `GET /scenario/{id}/detail`, `POST /scenario` 연동 |
| 3.3 | **디바이스 관리** | BACKLOG Feature 7, API.md §6 | `GET /device/type/list`, `POST /device/register`, `PUT /device/{id}` 연동, DeviceList 등 페이지에 적용 |
| 3.4 | **에셋·Studio** | BACKLOG Feature 8·9, API.md §4·7 등 | 아이템/캐릭터/검사/증상 등 관련 API와 Studio·에셋 페이지 연동 |
| 3.5 | **프로덕트(상품) 관리** | API.md §Product, openapi.json | `productService`, `useProduct` — `GET /product/list`, `GET /product/{id}`, `POST /product`, `PUT /product/{id}`, `DELETE /product/{id}` 연동, ProductManagement/ProductCreate/ProductEdit/ProductDetail 페이지 적용 |
| 3.6 | **커리큘럼 관리** | API.md §Curriculum | 커리큘럼 CRUD API 연동, 클래스·프로덕트와 연계된 커리큘럼 관리 기능 |
| 3.7 | **에러·엣지 케이스** | openapi.json responses (400/404/409 등) | 로그인 404/409, 회원가입 400/404/409 등 메시지 노출 및 사용자 안내 문구 정리 |

**완료 기준**:  
- BACKLOG에 있는 "API 연동 완료"가 아닌 Feature는 실제 호출·응답 처리까지 완료  
- 프로덕트 관리(생성/수정/삭제/목록/상세) 기능이 정상 동작  
- 커리큘럼 관리 기능이 클래스·프로덕트와 연계되어 정상 동작  
- 주요 플로우에서 백엔드 에러 메시지가 화면에 적절히 표시됨  

---

## Phase 4: 검증 및 마무리

**목표**: 통합 동작 검증, 접근성·반응형 최종 점검, 룰셋·문서 정리.

| 순서 | 작업 | 참고 위치 | 산출물 |
|------|------|-----------|--------|
| 4.1 | **주요 플로우 수동/E2E 검증** | 로그인·회원가입·클래스·기관 등 | 체크리스트 또는 E2E 시나리오로 "Happy path + 주요 에러" 검증 |
| 4.2 | **UX 룰셋 체크리스트** | ux-design-ruleset.md | PR 전 체크리스트 완료(공유 컴포넌트, 인라인 스타일 미사용, 반응형, 접근성 등) |
| 4.3 | **API 문서·타입 동기화** | `docs/api/API.md`, `openapi.json` | 백엔드 스펙 변경 시 API.md·openapi.json·`src/types/api` 동기화 |
| 4.4 | **BACKLOG 갱신** | `.github/BACKLOG.md` | 완료된 항목 체크, 미완료 작업은 해당 Feature 브랜치/이슈에 반영 |

**완료 기준**:  
- 배포 가능한 수준의 품질로 주요 플로우 검증 완료  
- 룰셋 위반 없음, 문서와 타입이 백엔드와 맞음  

---

## 요약: Phase별 한 줄 목표

| Phase | 한 줄 목표 |
|-------|------------|
| **Phase 1** | 백엔드 스펙(openapi/API.md)에 맞게 타입·서비스·훅 정합성 맞추기 |
| **Phase 2** | 디자인 업데이트(페이지 추가·수정) 반영 + UX 룰셋(공유 컴포넌트·스타일·접근성) 준수 |
| **Phase 3** | Feature별 API 연동 완료 (시나리오·디바이스·프로덕트·커리큘럼 등) + 에러/엣지 케이스 처리 |
| **Phase 4** | 검증(E2E/수동)·룰셋 체크리스트·문서/BACKLOG 정리 |

---

**문서 위치**: `my-app/docs/FRONTEND_DEVELOPMENT_PHASES.md`  
**갱신**: 백엔드 API·디자인 변경 시 해당 Phase 항목만 수정하면 됨.
