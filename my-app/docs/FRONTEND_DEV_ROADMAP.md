# 프론트엔드 개발 로드맵 (Phase별)

**작성일**: 2026-02-11  
**기준**: 백엔드 API (openapi.json, API.md) + 디자인(screenshots/) + BACKLOG.md

---

## 📊 현재 상황 요약

### ✅ 완료된 Feature
- **Feature 1**: 인증/인가 (로그인, 회원가입, 비밀번호 관리, 계정 관리) — API 연동 완료
- **Feature 3**: 클래스 관리 (CRUD, 수강신청, 시나리오 조회) — API 연동 완료
- **Feature 5**: 기관 관리 (CRUD, 유저/라이선스 조회) — API 연동 완료
- **Feature 6**: 사용자 관리 (Admin) — API 연동 완료

### ⚠️ UI만 구현됨 (API 미연동)
- **Feature 4**: 시나리오 관리 (목록/상세/생성/수정/삭제)
- **Feature 7**: 디바이스 관리 (DeviceList.tsx 존재)
- **Feature 8**: 에셋 관리 (이벤트/증상/태스크/액션/대화/아이템)
- **Feature 9**: Studio 편집기 (StudioEdit.tsx 존재)

### 🔄 부분 완료
- **Feature 2**: 대시보드 (API 호출 구조만 있음, 실제 엔드포인트 미확인)
- **Feature 10**: 커리큘럼/라이선스/프로덕트 (일부 API 연동, Mock 데이터 혼재)

### 📸 디자인 스크린샷 (screenshots/)
- **admin-all/**: 27개 화면 (대시보드, 기관고객, 클래스, 프로덕트, 사용자, 시나리오, 주문, 에셋)
- **master-all/**: 12개 화면 (대시보드, 클래스, 프로덕트, 시나리오, 기관)
- **student-all/**: 10개 화면 (대시보드, 클래스, 주문, 설정)

---

## Phase 1: 백엔드 API 정합성 확보 (1-2주)

**목표**: openapi.json/API.md와 프론트 타입·서비스·훅을 완전히 일치시키고, Mock 데이터를 실제 API로 전환

### 1.1 타입 정의 동기화
| 작업 | 파일 | 내용 |
|------|------|------|
| 요청/응답 DTO 점검 | `src/types/api/*.d.ts` | openapi.json schemas와 일치 여부 확인, 누락된 DTO 추가 |
| 에러 응답 타입 | `src/types/api/index.ts` | 400/404/409 등 에러 메시지 타입 정의 |
| Enum 타입 | `src/types/api/enum.d.ts` | `/enum` API 응답 구조와 일치 확인 |

### 1.2 인증·유저 API 검증
| 작업 | 파일 | 내용 |
|------|------|------|
| 로그인 필드 확인 | `authService.ts`, `Login.tsx` | `loginId`/`password` 필드명, 404/409 에러 처리 |
| 회원가입 약관 | `Signup.tsx` | `termsIdList` 필수 전송, 400/404/409 에러 메시지 노출 |
| 프로필 수정 | `Settings.tsx` | `PATCH /user/profile` 요청 필드(`realName`, `profileImageUrl`, `affiliation`) |
| 비밀번호 변경 | `PasswordResetNew.tsx` | `resetToken` + `newPassword` 전송 확인 |

### 1.3 Mock 데이터 → Real API 전환
| Feature | 파일 | 작업 |
|---------|------|------|
| 대시보드 | `MasterDashboard.tsx`, `StudentDashboard.tsx`, `AdminDashboard.tsx` | 백엔드에 대시보드 API 확인 후 연동 (없으면 Mock 유지 명시) |
| 라이선스 | `licenseService.ts`, `LicenseList.tsx` | Mock 데이터 제거, 실제 API 호출로 교체 |
| 프로덕트 | `productService.ts`, `ProductList.tsx` | `GET /product/list`, `GET /product/{id}` 연동 |
| 커리큘럼 | `curriculumService.ts`, `CurriculumList.tsx` | `GET /curriculum/list`, `GET /curriculum/organization/list` 연동 |

### 1.4 신규 API 추가
| API | 파일 생성 | 내용 |
|-----|----------|------|
| 디바이스 | `src/services/deviceService.ts` | `GET /device/type/list`, `POST /device/register`, `PUT /device/{id}` |
| 시나리오 플레이 기록 | `src/services/scenarioPlayRecordService.ts` | `GET /scenario-play-record` (MongoDB 기록) |
| 기관 게시글 | `organizationPostService.ts` (확인) | `POST /organization-post`, `GET /organization-post/list`, `PUT/DELETE` |

**완료 기준**:
- [ ] 모든 API 호출이 openapi.json 스펙과 일치
- [ ] Mock 데이터 사용 위치 명시 (주석 또는 문서)
- [ ] 주요 플로우(로그인·회원가입·클래스·기관)에서 에러 메시지 정상 노출

---

## Phase 2: 디자인 스크린샷 기반 페이지 구현/수정 (2-3주)

**목표**: screenshots/ 디자인을 보고 누락·불일치 페이지를 추가/수정하고, UX 룰셋 준수

### 2.1 Admin 페이지 (27개 화면)
| 화면 | 파일 | 작업 |
|------|------|------|
| 01-dashboard | `AdminDashboard.tsx` | 통계 카드·차트 레이아웃, API 연동 (있으면) |
| 02-기관고객관리 | `OrganizationList.tsx` | 검색·필터·페이지네이션, 라이선스 상태 표시 |
| 03-기관고객-상세 | `OrganizationDetail.tsx` | 탭(기본정보·라이선스·사용자·기기·게시글), 수정/삭제 버튼 |
| 04-클래스관리 | `AdminClassManagement.tsx` | 오픈/기관 클래스 탭, 검색·필터, 생성 버튼 |
| 05-오픈클래스-생성 | `OpenClassCreate.tsx` | 폼 레이아웃, 시나리오 선택 모달, 유효성 검사 |
| 06-기관클래스-생성 | `ClassCreate.tsx` | 기관 선택, 라이선스 연결, 시나리오 추가 |
| 07-오픈클래스-상세 | `OpenClassDetail.tsx` | 정보·참가자·평가 탭, 복제/편집/삭제 버튼 |
| 07a-참가자평가관리 | `ClassParticipantModal.tsx` | 참가자별 점수·완료율, 엑셀 다운로드 |
| 07b-참가자목록편집 | `ClassParticipantModal.tsx` | 참가자 추가/삭제, 권한 변경 |
| 07d-복제-페이지 | (신규) | 클래스 복제 기능 추가 |
| 08-오픈클래스-편집 | `OpenClassEdit.tsx` | 폼 수정, 시나리오 재배치 |
| 09-기관클래스-상세 | `ClassDetail.tsx` | 기관 클래스 전용 레이아웃 |
| 10-기관클래스-편집 | `ClassEdit.tsx` | 기관 클래스 수정 |
| 11-프로덕트관리 | `ProductManagement.tsx` | 목록·검색·생성 버튼 |
| 12-프로덕트-생성 | `ProductCreate.tsx` | 시나리오 선택, 편집모드 토글 |
| 12a-편집모드 | `ProductCreate.tsx` | 드래그 앤 드롭으로 시나리오 순서 변경 |
| 12b-초기화후 | `ProductCreate.tsx` | 초기화 확인 모달 |
| 13-프로덕트-상세 | `ProductDetail.tsx` | 정보·시나리오 목록, 편집/삭제 |
| 14-프로덕트-편집 | `ProductEdit.tsx` | 수정 폼 |
| 15-사용자관리 | `UserManagement.tsx` | 조건별 필터, 일괄 작업(상태 전환·삭제·엑셀) |
| 17-시나리오관리 | `AdminScenarioManagement.tsx` | 목록·검색·생성 |
| 18-시나리오-상세 | `ScenarioDetail.tsx` | 정보·플로우·에셋, 편집/삭제 |
| 19-주문관리 | `OrderManagement.tsx` | 주문 목록·상태·검색 |
| 20-주문등록 | `OrderCreate.tsx` | 주문 생성 폼 |
| 21-에셋-이벤트관리 | `EventManagement.tsx` | 이벤트 목록·생성·편집 |
| 22-에셋-이벤트생성 | `EventCreate.tsx` | 이벤트 생성 폼 |
| 23-에셋-증상 | `SymptomManagement.tsx` | 증상 목록·생성·편집 |
| 24-에셋-태스크 | `pages/assets/TaskManagement.tsx` (신규) | 태스크 목록·생성 |
| 25-에셋-액션 | `pages/assets/ActionManagement.tsx` (신규) | 액션 목록·생성 |
| 26-에셋-대화 | `DialogueManagement.tsx` | 대화 목록·생성 |
| 27-에셋-아이템 | `ItemManagement.tsx` | 아이템 목록·생성 |

### 2.2 Master 페이지 (12개 화면)
| 화면 | 파일 | 작업 |
|------|------|------|
| 01-dashboard | `MasterDashboard.tsx` | 통계 카드, 최근 클래스, API 연동 |
| 02-my-classes | `MyClassList.tsx` | 내 클래스 목록, 필터 |
| 03-class-management | `MasterClassManagement.tsx` | 클래스 관리, 생성 버튼 |
| 04-product-management | `ProductManagement.tsx` | 프로덕트 목록 (Master용) |
| 05-product-create | `ProductCreate.tsx` | 프로덕트 생성 (Master용) |
| 06-open-class-create | `OpenClassCreate.tsx` | 오픈 클래스 생성 (Master용) |
| 07-class-create | `MyClassCreate.tsx` | 기관 클래스 생성 (Master용) |
| 08-scenarios | `MasterScenarioManagement.tsx` | 시나리오 목록·생성 |
| 09-organization | `MyOrganization.tsx` | 소속 기관 정보 |
| 11-scenario-detail | `ScenarioDetail.tsx` | 시나리오 상세 (Master용) |
| 12-product-detail | `ProductDetail.tsx` | 프로덕트 상세 (Master용) |

### 2.3 Student 페이지 (10개 화면)
| 화면 | 파일 | 작업 |
|------|------|------|
| 01-dashboard | `StudentDashboard.tsx` | 통계, 최근 클래스, 공지사항 |
| 02-my-classes | `MyClassList.tsx` | 수강 중 클래스 목록 |
| 03-open-class-list | `OpenClassList.tsx` | 오픈 클래스 목록, 장바구니 담기 |
| 04-cart | `Cart.tsx` | 장바구니, 결제 버튼 |
| 04-orders | `Orders.tsx` | 주문 내역 |
| 05-order-confirm | `OrderConfirm.tsx` | 주문 확인 페이지 |
| 05-settings | `Settings.tsx` | 프로필·비밀번호·이메일 변경 |
| 06-enrolled-class-detail | `EnrolledClassDetail.tsx` | 수강 클래스 상세 |
| 07-settings | `Settings.tsx` | (중복, 확인 필요) |
| 08-class-invite-accept | `ClassInviteAccept.tsx` | 초대 수락 페이지 |
| 09-enrolled-class-detail | `EnrolledClassDetail.tsx` | (중복, 확인 필요) |

### 2.4 UX 룰셋 준수 체크
| 항목 | 체크 내용 |
|------|----------|
| 공유 컴포넌트 | `PageHeader`, `Button`, `Modal`, `Table`, `Badge` 등 우선 사용 |
| 인라인 스타일 금지 | 동적 값 제외, Tailwind·`ui.css`·`pages.css` 사용 |
| 반응형 | 모바일(1열)·태블릿(2열)·데스크톱(3열+) 그리드, 터치 타겟 44x44px |
| 접근성 | 키보드 네비게이션, `focus:ring`, ARIA 레이블, 색상 대비 4.5:1 |
| 간격 시스템 | `gap-6`(24px), `gap-4`(16px), `space-y-4` 등 일관성 |

**완료 기준**:
- [ ] 모든 스크린샷 화면이 실제 페이지로 구현됨
- [ ] UX 룰셋 체크리스트 통과
- [ ] 중복 페이지 정리 (07-settings, 09-enrolled-class-detail 등)

---

## Phase 3: Feature별 API 연동 및 에러 처리 (2-3주)

**목표**: UI만 있는 Feature에 백엔드 API를 연동하고, 에러·엣지 케이스 처리

### 3.1 시나리오 관리 (Feature 4)
| 작업 | API | 파일 |
|------|-----|------|
| 목록 조회 | `GET /scenario/list` | `scenarioService.ts`, `AdminScenarioManagement.tsx` |
| 상세 조회 | `GET /scenario/{id}/detail` | `ScenarioDetail.tsx` |
| 생성 | `POST /scenario` | `ScenarioAddModal.tsx` (CreateScenarioRequestDto 매핑) |
| 수정 | `PUT /scenario/{id}` (확인 필요) | `ScenarioDetail.tsx` |
| 삭제 | `DELETE /scenario/{id}` (확인 필요) | `ScenarioDetail.tsx` |
| 라이선스별 조회 | `GET /scenario/license` | `ScenarioList.tsx` |

### 3.2 디바이스 관리 (Feature 7)
| 작업 | API | 파일 |
|------|-----|------|
| 타입 목록 | `GET /device/type/list` | `deviceService.ts` 신규 |
| 등록 | `POST /device/register` | `DeviceList.tsx`, EditDeviceModal |
| 수정 | `PUT /device/{id}` | `EditDeviceModal.tsx` |
| 기관별 기기 목록 | `GET /license/{organizationId}/device` | `LicenseDetail.tsx` |

### 3.3 에셋 관리 (Feature 8)
| 작업 | API | 파일 |
|------|-----|------|
| 아이템 목록 | `GET /item/list/option` | `ItemManagement.tsx` |
| 캐릭터 목록 | `GET /character/list` | `EventManagement.tsx` |
| 스킬/액션 | `GET /skill/list`, `GET /action/list` | `ActionManagement.tsx` (신규) |
| 환자 의상/포즈 | `GET /patient-clothing/list`, `GET /pose/list` | `SymptomManagement.tsx` |
| 검사/문진/증상 | `GET /medical-test/category/list`, `/patient-symptom/list` 등 | 각 에셋 페이지 |

### 3.4 Studio 편집기 (Feature 9)
| 작업 | API | 파일 |
|------|-----|------|
| 프리셋 조회 | (백엔드 확인 필요) | `StudioEdit.tsx` |
| 시나리오 저장 | `POST /scenario` | `StudioEdit.tsx` |
| 파일 업로드 | `POST /file/presigned-url` | `fileService.ts` |

### 3.5 에러 처리 강화
| 에러 코드 | 처리 위치 | 내용 |
|-----------|----------|------|
| 400 | 폼 제출 시 | 필드별 에러 메시지 표시 (약관 미동의, 유효성 검사 실패 등) |
| 404 | 로그인, 조회 | "존재하지 않는 계정/리소스입니다" 메시지 |
| 409 | 회원가입, 생성 | "이미 사용중인 ID/이름입니다" 메시지 |
| 401 | 인증 만료 | 자동 로그아웃 + 로그인 페이지 이동 (apiClient에서 처리) |
| 403 | 권한 부족 | "권한이 없습니다" 메시지 + 이전 페이지 |

**완료 기준**:
- [ ] BACKLOG에서 "⚠️ UI 구현됨" 상태인 Feature가 "✅ API 연동 완료"로 변경
- [ ] 주요 에러 시나리오에서 사용자 친화적 메시지 노출
- [ ] 로딩 상태(Skeleton, Spinner) 및 빈 상태(Empty State) 처리

---

## Phase 4: 검증 및 배포 준비 (1-2주)

**목표**: 통합 검증, 성능 최적화, 문서 정리, 배포

### 4.1 통합 검증
| 항목 | 내용 |
|------|------|
| 주요 플로우 수동 테스트 | 로그인→회원가입→클래스 생성→수강신청→시나리오 실행 |
| 권한별 접근 제어 | Student/Master/Admin 역할별 메뉴·페이지 접근 확인 |
| 에러 시나리오 | 잘못된 입력, 네트워크 오류, 인증 만료 등 |
| 반응형 테스트 | 모바일(375px)·태블릿(768px)·데스크톱(1280px+) |
| 접근성 테스트 | 키보드만으로 주요 플로우 완료, 스크린 리더 테스트 |

### 4.2 성능 최적화
| 작업 | 내용 |
|------|------|
| 이미지 최적화 | WebP 변환, Lazy loading |
| 코드 스플리팅 | React.lazy로 페이지별 분리 |
| API 캐싱 | React Query로 중복 요청 방지 |
| 번들 크기 분석 | webpack-bundle-analyzer로 큰 의존성 확인 |

### 4.3 문서 정리
| 문서 | 내용 |
|------|------|
| `docs/api/API.md` | 백엔드 API 최신 버전 반영 |
| `docs/api/openapi.json` | 전체 스펙 동기화 |
| `.github/BACKLOG.md` | 완료 항목 체크, 미완료 작업 정리 |
| `README.md` | 설치·실행·환경변수·배포 가이드 |
| `CHANGELOG.md` | 버전별 변경사항 기록 |

### 4.4 배포 준비
| 작업 | 내용 |
|------|------|
| 환경변수 설정 | `REACT_APP_API_BASE_URL` 등 프로덕션 값 |
| 빌드 테스트 | `npm run build` 성공, 빌드 크기 확인 |
| CI/CD 설정 | GitHub Actions로 자동 배포 (`.github/workflows/deploy-test.yml` 확인) |
| 에러 모니터링 | Sentry 등 에러 트래킹 도구 설정 |

**완료 기준**:
- [ ] 주요 플로우 E2E 테스트 통과
- [ ] UX 룰셋 체크리스트 100% 준수
- [ ] 프로덕션 빌드 성공, 배포 완료
- [ ] 문서 최신화 완료

---

## 📅 전체 일정 요약

| Phase | 기간 | 주요 산출물 |
|-------|------|------------|
| **Phase 1** | 1-2주 | 타입·서비스·훅 동기화, Mock→Real API 전환 |
| **Phase 2** | 2-3주 | 27개(Admin)+12개(Master)+10개(Student) 화면 구현/수정 |
| **Phase 3** | 2-3주 | 시나리오·디바이스·에셋·Studio API 연동, 에러 처리 |
| **Phase 4** | 1-2주 | 통합 검증, 성능 최적화, 문서 정리, 배포 |
| **총 기간** | **6-10주** | 프로덕션 배포 가능 상태 |

---

**문서 위치**: `my-app/docs/FRONTEND_DEV_ROADMAP.md`  
**갱신**: Phase 완료 시 체크박스 업데이트, 새 요구사항 발생 시 해당 Phase에 추가
