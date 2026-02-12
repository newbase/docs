# 프로젝트 백로그 (Feature별)

이 문서는 Medicrew Platform 웹 서비스의 Feature별 개발 백로그입니다. 각 Feature는 독립적인 브랜치(`feature/[번호]-[이름]`)에서 개발됩니다.

> **참고**: 이 백로그는 GitHub Issues로 변환하여 프로젝트 관리에 활용할 수 있습니다.

---

## Feature 1: 인증/인가 시스템 (Authentication & Authorization)

**브랜치**: `feature/1-auth`  
**우선순위**: 🔴 높음  
**상태**: ✅ API 연동 완료

### 주요 작업

#### 1.1 로그인/회원가입
- [x] 인증 서비스 구조 구축 (`src/services/authService.ts`)
- [x] JWT 토큰 관리 시스템
- [x] Login/Signup 페이지에 실제 API 호출 연동 (`POST /user/login`, `POST /user/signup`)
- [x] useUser / useAuth 훅 연동 (USE_MOCK_DATA=false 기준 Real API)
- [ ] 로그인/회원가입 E2E 통합 검증 (선택)

#### 1.2 비밀번호 관리
- [x] 비밀번호 재설정 요청 API (`POST /auth/password-reset`)
- [x] 비밀번호 변경 API (`POST /user/change-password`) — useAuth
- [ ] 비밀번호 변경 API (설정 페이지 내 본인 변경) — 필요 시 연동

#### 1.3 이메일 인증
- [x] 이메일 인증 요청 API (`POST /auth/send-verification-email`)
- [x] 이메일 인증 확인 API (`POST /auth/verify-verification-code`)
- [ ] 이메일 변경 API (Swagger 확인 후)

#### 1.4 계정 관리
- [x] 계정 삭제 인증 코드 발송/검증 (`POST /auth/send-deletion-code`, `POST /auth/verify-deletion-code`)
- [x] 회원 탈퇴 API (`DELETE /user/my-account`)
- [x] 계정 정보 조회/수정 (`GET /user/profile`, `PATCH /user/profile`)

---

## Feature 2: 대시보드 (Dashboard)

**브랜치**: `feature/2-dashboard`  
**우선순위**: 🔴 높음  
**상태**: 🔄 API 호출 구조 완료

### 주요 작업

#### 2.1 학생 대시보드
- [x] 기본 API 호출 함수 구현
- [x] API 클라이언트로 마이그레이션 완료
- [ ] Swagger 문서에서 실제 대시보드 API 엔드포인트 확인
- [ ] 학생 대시보드 API 통합 검증 (`GET /api/dashboard/student/:userId`)
- [ ] 요청/응답 타입 확인 및 매핑
- [ ] 대시보드 통계 데이터 실시간 업데이트

#### 2.2 마스터 대시보드
- [x] 기본 API 호출 함수 구현
- [x] API 클라이언트로 마이그레이션 완료
- [ ] 마스터 대시보드 API 통합 검증 (`GET /api/dashboard/master/:userId`)
- [ ] 요청/응답 타입 확인 및 매핑

#### 2.3 Admin 대시보드
- [ ] Admin 대시보드 API 통합 (`GET /api/dashboard/admin`)
- [ ] 관리자 전용 통계 데이터

---

## Feature 3: 클래스 관리 (Class Management)

**브랜치**: `feature/3-class-management`  
**우선순위**: 🔴 높음  
**상태**: ✅ API 연동 완료 (Course → Class 전환)

### 주요 작업

#### 3.1 클래스 CRUD
- [x] 클래스 목록 조회 (`GET /class/organization/list`) — classService, useClasses
- [x] 클래스 상세 조회 (`GET /class/{classId}`)
- [x] 클래스 생성 (`POST /class`)
- [x] 클래스 수정 (`PUT /class/{classId}`)
- [x] 클래스 삭제 (`DELETE /class/{classId}`)
- [x] 쿼리 파라미터 (organizationId, startDate, endDate, isActive, title, page, pageSize)

#### 3.2 클래스 참여자 관리
- [x] 클래스 수강신청 (`POST /class/{classId}/enroll`)
- [ ] 참여자 목록/삭제 API — Swagger 확인 후

#### 3.3 클래스·시나리오
- [x] 클래스별 시나리오 조회 (`GET /scenario/{classId}/class`)

---

## Feature 4: 시나리오 관리 (Scenario Management)

**브랜치**: `feature/4-scenario-management`  
**우선순위**: 🟡 중간  
**상태**: ⚠️ UI 구현됨

### 주요 작업

#### 4.1 시나리오 CRUD
- [ ] 시나리오 목록 조회 API
- [ ] 시나리오 상세 조회 API
- [ ] 시나리오 생성 API
- [ ] 시나리오 수정 API
- [ ] 시나리오 삭제 API

#### 4.2 시나리오 실행/시뮬레이션
- [ ] 시나리오 실행 API
- [ ] 시뮬레이션 결과 조회 API

---

## Feature 5: 조직(기관) 관리 (Organization Management)

**브랜치**: `feature/5-organization-management`  
**우선순위**: 🟡 중간  
**상태**: ✅ API 연동 완료

### 주요 작업

#### 5.1 기관 CRUD
- [x] 기관 목록 조회 (`GET /organization/list`) — organizationService, useOrganization
- [x] 기관 상세 조회 (`GET /organization/{organizationId}/detail`)
- [x] 기관 생성 (`POST /organization`) — OrganizationRegistration, AddOrganizationModal
- [x] 기관 수정 (`PUT /organization/{organizationId}`) — EditOrganizationModal
- [x] 기관 삭제 (`DELETE /organization/{organizationId}`)

#### 5.2 기관 관련
- [x] 기관별 유저 리스트 (`GET /user/organization/{organizationId}/list`)
- [x] 기관별 라이선스/기기 — licenseService, LicenseDetail

---

## Feature 6: 사용자(회원) 관리 (User Management — Admin)

**브랜치**: `feature/6-user-management`  
**우선순위**: 🟡 중간  
**상태**: ✅ API 연동 완료

### 주요 작업

#### 6.1 회원 관리 (Admin)
- [x] 조건별 회원 목록 (`GET /user/option/list`) — useUserListWithFilters, UserManagement
- [x] 전체 회원 수 (`GET /user/all/count`)
- [x] 회원 삭제 (`DELETE /user/list`) — useDeleteUsers
- [x] 회원 상태 전환 (`POST /user/status/list`)
- [x] 기관별 정회원 등록 (`POST /user/organization-member/list`) — AddMemberModal
- [x] 일괄 등록/템플릿/엑셀 추출 (`GET /user/bulk-upload-template`, `POST /user/bulk-create`, `POST /user/export-excel`)

---

## Feature 7: 디바이스 관리 (Device Management)

**브랜치**: `feature/7-device-management`  
**우선순위**: 🟡 중간  
**상태**: ⚠️ UI 구현됨 (DeviceList.tsx)

### 주요 작업

#### 7.1 디바이스 CRUD
- [ ] 디바이스 목록 조회 API (`GET /api/devices`)
- [ ] 디바이스 상세 조회 API (`GET /api/devices/:id`)
- [ ] 디바이스 등록 API (`POST /api/devices`)
- [ ] 디바이스 수정 API (`PUT /api/devices/:id`)
- [ ] 디바이스 삭제 API (`DELETE /api/devices/:id`)

#### 7.2 디바이스 상태 관리
- [ ] 디바이스 상태 변경 API (활성/비활성)
- [ ] 디바이스 접속 로그 조회 API

---

## Feature 8: 에셋 관리 (Asset Management)

**브랜치**: `feature/8-asset-management`  
**우선순위**: 🟡 중간  
**상태**: ⚠️ UI 구현됨

### 주요 작업

#### 8.1 에셋 CRUD
- [ ] 에셋 목록 조회 API
- [ ] 에셋 업로드 API (이미지, 오디오 등)
- [ ] 에셋 수정 API
- [ ] 에셋 삭제 API

#### 8.2 카테고리/이벤트 관리
- [ ] 카테고리 관리 API
- [ ] 이벤트 관리 API (`/api/assets/events`)
- [ ] 다이얼로그 관리 API

---

## Feature 9: Studio 편집기 (Studio Editor)

**브랜치**: `feature/9-studio-editor`  
**우선순위**: 🟡 중간  
**상태**: ⚠️ UI 구현됨

### 주요 작업

#### 9.1 Studio 프리셋
- [ ] Studio 프리셋 조회 API
- [ ] Studio 프리셋 저장 API

#### 9.2 시나리오 에디터
- [ ] 시나리오 에디터 데이터 저장 API
- [ ] 드래그 앤 드롭 데이터 저장

---

## Feature 10: API 인프라 (API Infrastructure)

**브랜치**: (완료)  
**우선순위**: 🔴 높음  
**상태**: ✅ 완료

### 완료된 작업

- [x] 통합 API 클라이언트 생성 (`src/services/apiClient.ts`)
- [x] 요청 인터셉터 구현 (JWT 토큰 자동 주입)
- [x] 응답 인터셉터 구현 (401 에러 처리, 공통 에러 처리)
- [x] 타입 안전한 API 호출 (TypeScript 제네릭)
- [x] API 에러 타입 정의 및 처리
- [x] 기존 fetch 호출 마이그레이션

### 향후 개선

- [ ] 전역 에러 핸들러 구현
- [ ] API 에러 메시지 사용자 친화적 표시 개선
- [ ] 재시도 로직 구현
- [ ] 로딩 상태 UI 개선
- [ ] 스켈레톤 로딩 컴포넌트 추가

---

## Feature 11: 보안 강화 (Security)

**브랜치**: `feature/11-security`  
**우선순위**: 🔴 높음  
**상태**: 🔄 기본 구현됨

### 주요 작업

#### 11.1 인증 보안
- [x] JWT 토큰 관리 (기본 구현 완료)
- [ ] JWT 토큰 안전한 저장 (HttpOnly Cookie 검토)
- [ ] CSRF 토큰 구현
- [ ] XSS 방어 (입력 값 sanitization)
- [ ] 세션 타임아웃 처리

#### 11.2 권한 관리
- [ ] RequirePermission 가드 완성
- [ ] API 레벨 권한 검증
- [ ] RBAC 시스템 완성

#### 11.3 데이터 보안
- [ ] 민감 정보 마스킹
- [ ] 파일 업로드 보안 검증
- [ ] API 요청 레이트 리미팅

---

## Feature 12: 성능 최적화 (Performance)

**브랜치**: `feature/12-performance`  
**우선순위**: 🟢 중간  
**상태**: ⚠️ 미구현

### 주요 작업

#### 12.1 코드 최적화
- [ ] React.memo 적용 (불필요한 리렌더링 방지)
- [ ] useMemo, useCallback 최적화
- [ ] 이미지 최적화 (lazy loading, WebP 변환)
- [ ] 번들 크기 최적화 (코드 스플리팅)

#### 12.2 캐싱 전략
- [ ] React Query 또는 SWR 도입 검토
- [ ] API 응답 캐싱 구현
- [ ] 로컬 스토리지 캐싱 전략

#### 12.3 렌더링 최적화
- [ ] 가상 스크롤링 (긴 목록)
- [ ] 지연 로딩 (Lazy Loading) 개선
- [ ] Suspense 경계 설정

---

## Feature 13: 테스트 (Testing)

**브랜치**: `feature/13-testing`  
**우선순위**: 🔵 낮음  
**상태**: ⚠️ 미구현

### 주요 작업

#### 13.1 단위 테스트
- [ ] 유틸리티 함수 테스트
- [ ] 커스텀 훅 테스트
- [ ] 컴포넌트 테스트 (중요 컴포넌트)

#### 13.2 통합 테스트
- [ ] API 통합 테스트
- [ ] 인증 플로우 테스트
- [ ] 라우팅 테스트

#### 13.3 E2E 테스트 (선택사항)
- [ ] 주요 사용자 시나리오 테스트
- [ ] Playwright 또는 Cypress 도입 검토

---

## Feature 14: 문서화 및 운영 (Documentation & Operations)

**브랜치**: `feature/14-documentation`  
**우선순위**: 🔵 낮음  
**상태**: 🔄 부분 구현됨

### 주요 작업

#### 14.1 API 문서화
- [ ] API 엔드포인트 문서 작성
- [ ] 요청/응답 예시 문서화
- [ ] 에러 코드 문서화

#### 14.2 사용자 문서
- [ ] 사용자 가이드 작성
- [ ] 관리자 매뉴얼 작성

#### 14.3 개발 문서
- [ ] 아키텍처 문서
- [ ] 배포 가이드 보완
- [ ] 트러블슈팅 가이드

#### 14.4 배포 및 모니터링
- [x] CI/CD 파이프라인 (GitHub Actions - 테스트 서버 배포 완료)
- [ ] 프로덕션 배포 파이프라인 설정
- [ ] 에러 로깅 시스템 (Sentry 등)
- [ ] 성능 모니터링 (Web Vitals)
- [ ] 사용자 분석 (Google Analytics 등)

---

## 우선순위 요약

### 완료 ✅
1. Feature 1: 인증/인가 — API 연동 완료
2. Feature 3: 클래스 관리 — Class API 연동 완료
3. Feature 5: 기관 관리 — API 연동 완료
4. Feature 6: 회원 관리 — API 연동 완료
5. Feature 10: API 인프라 — 완료

### 대기/검증 🔴
6. Feature 2: 대시보드 — Swagger에 API 미존재, 백엔드 요청 또는 Mock 유지

### 중요 (필요 시) 🟡
7. Feature 4: 시나리오 관리
8. Feature 7: 디바이스 관리
9. Feature 8: 에셋 관리
10. Feature 9: Studio 편집기
11. Feature 11: 보안 강화

### 일반 (1개월 내) 🟢
12. Feature 12: 성능 최적화

### 개선 (나중에) 🔵
13. Feature 13: 테스트
14. Feature 14: 문서화 및 운영

---

## 진행 현황

- **완료**: Feature 1 (인증/인가), Feature 3 (클래스), Feature 5 (기관), Feature 6 (회원 관리), Feature 10 (API 인프라) ✅
- **커리큘럼·상품·플레이 기록**: 타입·서비스·훅·목록 페이지·모달·라우트 구현 완료 (2026-02-04, TASK_LOG_일자별.md)
- **대시보드**: Swagger에 대시보드 API 미존재 — 백엔드 요청 또는 Mock 유지
- **대기/선택**: Feature 4 (시나리오 CRUD), 7 (디바이스), 8 (에셋), 9 (Studio), 11 (보안), 12-14 (성능/테스트/문서화)

---

## 다음 마일스톤

1. **대시보드/초대 API** — 백엔드와 스펙 확정 후 연동
2. **Feature 4, 7-9** — Swagger 기준 API 통합 (필요 시)
3. **Feature 12-14** — 성능 최적화, 테스트, 문서화 (선택)

---

**최종 업데이트**: 2026-02-05 (나머지 작업: BACKLOG·WORK_REVIEW·테스트 반영)
