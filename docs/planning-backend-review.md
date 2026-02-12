# 기획서 × 백엔드 시스템 개발 검토

현재 기획서(planning-spec.json, planning-spec-detail.md)가 **백엔드 시스템 개발에 필요한 기능 정의를 얼마나 반영했는지** 검토한 결과입니다.

---

## 1. 현재 반영된 것 (백엔드에 유리한 부분)

| 항목 | 반영 여부 | 설명 |
|------|------------|------|
| **화면별 기능 범위** | ✅ | 역할별 기능 정의(기능명, 경로, 컴포넌트)로 “어떤 화면이 어떤 기능을 제공하는지” 파악 가능 → API 도메인 구획에 활용 가능 |
| **테이블 표시 데이터** | ✅ | 컬럼명·표시 필드·데이터 소스(엔티티) 명시 → **목록/상세 API 응답 DTO 설계** 시 필드 후보로 사용 가능 |
| **필터/검색 조건** | ✅ | 필터 옵션(기간, 유형, 상태 등), 검색 대상 필드 기술 → **쿼리 파라미터(필터, 검색)** 설계에 직접 반영 가능 |
| **통계 산출식** | ✅ | 통계 항목별 산출식(SUM, COUNT, 비율, 기간 조건) 명시 → **집계 API·비즈니스 로직** 구현 시 요구사항으로 사용 가능 |
| **데이터 엔티티 요약** | ✅ | ClassItem, OrderRow, Organization, User 등 엔티티·주요 필드·출처 정리 → **도메인 모델·DB 스키마** 설계 참고 가능 |
| **사용자 워크플로우** | ✅ | 역할별 시나리오(단계별 화면·액션) 정리 → **상태 전이·권한 구간** 설계 시 참고 가능 |

---

## 2. 부족하거나 명시되지 않은 것 (백엔드 개발 시 보완 필요)

### 2.1 API 엔드포인트 명세

- **현재**: 기획서에는 **HTTP 메서드·경로·쿼리/바디 파라미터**가 나열되어 있지 않음.
- **백엔드에 필요한 것**:
  - 리소스별 **엔드포인트 목록** (예: `GET /organization/list`, `POST /organization`, `PUT /organization/:id`, `DELETE /organization/:id`)
  - **쿼리 파라미터** (페이지네이션: page, pageSize / 필터: search, status, startDate, endDate 등)
  - **경로 파라미터** (예: organizationId, classId, orderId)
- **참고**: 실제 엔드포인트는 `my-app/src/services/*.ts` 및 `types/api/*.d.ts`에 정의되어 있음.  
  - 예: organizationService, userServiceApi, classService, courseService, curriculumService, licenseService, productService, scenarioService, classInviteService(현재 Mock) 등.

**권장**: 기획서 또는 별도 API 명세에 “기능(화면) ↔ 엔드포인트” 매핑 테이블 추가.  
(예: 기관 관리 목록 → GET /organization/list, 기관 생성 → POST /organization)

---

### 2.2 Request / Response DTO 정리

- **현재**: “데이터 정의”에서 **엔티티·필드·출처**는 있으나, **API 요청/응답 DTO**는 기획서에 없음.
- **백엔드에 필요한 것**:
  - **요청 DTO**: 생성/수정 시 필수·선택 필드, 타입, 검증 규칙(형식, 길이, 범위)
  - **응답 DTO**: 목록 응답(배열 + totalCount 등), 상세 응답(단일 객체), 집계 응답(통계 필드)
- **참고**: `my-app/src/types/api/*.d.ts`에 이미 Request/Response 타입이 정의되어 있음  
  (예: CreateOrganizationRequestDto, GetOrganizationListResponseDto, GetUserListWithFiltersResponseDto, CreateClassRequestDto 등).

**권장**: 기획서 또는 “API 명세” 문서에 “주요 API별 Request/Response DTO 요약” 섹션 추가.  
(필드명, 타입, 필수 여부, 비고만 표로 정리해도 백엔드 구현·검증에 도움됨)

---

### 2.3 권한·역할별 API 접근

- **현재**: 역할별 “기능 정의”와 “워크플로우”는 있으나, **어떤 역할이 어떤 API를 호출할 수 있는지**는 기획서에 없음.
- **백엔드에 필요한 것**:
  - **역할(Student / Master / Admin)** 별 허용 API 목록 또는 “역할 × 리소스 × 메서드” 매트릭스
  - 인증(토큰) 필수 구간, 비인증 허용 구간(예: 로그인, 초대 코드 조회 등)
- **참고**: 라우트는 `RequireRole('admin'|'master'|'guest')` 등으로 보호되어 있으나, “API 레벨 권한”은 기획서에 기술되지 않음.

**권장**: “역할별 허용 기능”을 API 단위로 확장한 **권한 매트릭스** (또는 정책 요약)를 기획서 또는 백엔드 설계 문서에 추가.

---

### 2.4 비즈니스 규칙·상태 전이

- **현재**: 통계 산출식, 워크플로우 단계는 있으나, **주문 상태 전이**, **이수 조건**, **초대 코드 유효기간** 등 “규칙”이 백엔드용으로 명시되어 있지 않음.
- **백엔드에 필요한 것**:
  - **주문**: 상태 값(데모/견적, 주문진행, 주문완료, 취소요청, 취소승인, 환불완료 등)과 허용 전이(어떤 상태에서 어떤 상태로 변경 가능한지)
  - **클래스/이수**: 이수 완료 조건(최소 시나리오 수, 최소 점수, 전 시나리오 완료 여부), 수강기간 만료 시 동작
  - **초대 코드**: 유효기간(일), 최대 사용 횟수, 만료/사용 완료 시 동작
  - **기관/라이선스**: 상태(ACTIVE/INACTIVE/EXPIRED/EXPIRING_SOON), “만료 예정” 기준(예: 30일 이내)

**권장**: planning-spec-detail.md 또는 별도 “비즈니스 규칙” 문서에 **상태 값·허용 전이·계산 규칙**을 짧게 정리.  
(이미 코드에 반영된 내용을 문서로 끌어올리면 백엔드와 프론트가 동일한 규칙을 공유하기 쉬움)  
예: **오픈클래스 개설 권한** — Admin과 제휴기관 Master만 가능(일반 Master 불가). API·화면 노출 시 권한 검증 필요.

---

### 2.5 페이지네이션·정렬 규칙

- **현재**: 테이블/목록에서 “페이지당 건수”, “정렬 가능 컬럼”이 화면 관점으로는 일부 나오나, **API 쿼리 파라미터**로는 정리되어 있지 않음.
- **백엔드에 필요한 것**:
  - **공통**: page, pageSize (또는 offset/limit) 의미 및 기본값
  - **정렬**: sortBy, sortOrder (asc/desc) 또는 orderBy, direction 등, 정렬 가능 필드 목록
- **참고**: organizationService.getList(params), userServiceApi.getListWithFilters(params), classService params 등에 이미 page, pageSize 등이 사용됨.

**권장**: “목록 API”를 사용하는 화면별로 **쿼리 파라미터(필터, 검색, 페이지네이션, 정렬)** 를 한 줄씩 정리해 두면, 백엔드 API 스펙과 기획서를 맞추기 수월함.

---

### 2.6 검증·에러 규칙

- **현재**: “품목 1개 이상”, “필수 입력” 등 UI 측 검증은 상세 정의에 일부 나오나, **API 수준 검증 규칙·에러 코드**는 기획서에 없음.
- **백엔드에 필요한 것**:
  - 필수 필드, 형식(이메일, 전화번호, 날짜 형식), 길이 제한, 범위(숫자 min/max)
  - 실패 시 **HTTP 상태 코드** 및 **에러 코드/메시지** 규칙 (예: 400 Validation Error, 404 Not Found, 409 Conflict)

**권장**: 중요 API(기관 생성/수정, 주문 생성, 사용자 일괄 등록 등)에 대해 “검증 규칙 요약”과 “에러 응답 예시”를 API 명세 또는 기획서 보완 문서에 추가.

---

### 2.7 미구현·Mock API 정리

- **현재**: 기획서는 “기능이 있다”는 전제로 작성되어 있고, **실제 API 연동 여부**는 구분되어 있지 않음.
- **백엔드에 필요한 것**:
  - **이미 백엔드 존재**: organization, user, class, course, curriculum, license, product, scenario, auth 등 (services/*.ts, types/api 참고)
  - **Mock/미구현**:
    - **주문(Order)**: 목록/상세/생성/상태 변경이 MOCK_ORDERS 등 프론트 전용 상태로만 동작 → **주문 도메인 API 전반 설계·구현 필요**
    - **클래스 초대(Invite)**: classInviteService는 전부 Mock (createInvite, getInviteByToken, getInviteByCode, acceptInvite) → **초대 코드 생성/조회/수락 API 필요**
    - **대시보드 통계**: Student/Master/Admin 대시보드의 일부 통계가 mock 데이터 또는 프론트 집계 → **집계 API 필요 여부** 결정 및 명세 필요
    - **장바구니/견적 문의**: Cart, QuoteRequest 등은 로컬/별도 플로우일 수 있음 → **저장·조회 API 필요 여부** 정리 필요

**권장**: 기획서 또는 “API 현황” 문서에 **“미구현·Mock API 목록”**을 추가하고,  
- 주문(생성/목록/상세/상태변경)  
- 클래스 초대(코드 생성/조회/수락)  
- (선택) 대시보드 집계, 장바구니/견적  
등을 **백엔드 우선 구현 대상**으로 명시하면, 백엔드 개발 범위가 명확해짐.

---

## 3. 요약 및 권장 보완 사항

- **충분히 반영된 것**:  
  화면 단위 기능, 테이블 데이터, 필터/검색, 통계 산출식, 엔티티·필드, 워크플로우는 **백엔드의 도메인 구획, 목록/상세/집계 API 설계, 쿼리 파라미터 설계**에 그대로 활용 가능함.

- **보완하면 좋은 것** (우선순위 순):
  1. **미구현·Mock API 목록** 정리 (주문, 클래스 초대 등) → 백엔드 개발 범위 확정
  2. **주요 API ↔ 기능(화면)** 매핑 및 **엔드포인트·쿼리/바디 파라미터** 요약 → API 명세와 기획서 일치
  3. **Request/Response DTO 요약** (주요 API별 필드·타입·필수 여부) → 계약 정리 및 검증 룰 공유
  4. **역할별 API 접근(권한)** 정리 → 인증/인가 설계
  5. **비즈니스 규칙** (상태 전이, 이수 조건, 초대 유효기간 등) 명시 → 로직 일관성
  6. **페이지네이션·정렬** 규칙을 API 파라미터 수준으로 정리
  7. **검증·에러** 규칙 요약 (필수는 핵심 API 위주로)

위 항목을 기획서 본문에 넣거나, “API 명세”, “비즈니스 규칙”, “API 현황(미구현 목록)” 같은 **별도 문서**로 두어도 됨.  
이 검토는 `my-app/src/services/*.ts`, `types/api/*.d.ts`, `docs/planning-spec.json`, `docs/planning-spec-detail.md`를 기준으로 작성되었습니다.
