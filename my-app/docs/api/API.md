# Scenario Studio API 문서 (통합)

**문서 버전**: 1.0.0  
**OpenAPI**: 3.0.0  
**최종 갱신**: 2026-02-11

시나리오 스튜디오 백엔드 API 통합 참조 문서입니다.  
정규 스펙은 동일 폴더의 `openapi.json`을 참고하세요.

---

## 목차

1. [인증](#1-인증-authentication)
2. [유저 (User)](#2-유저-user)
3. [시나리오 (Scenario)](#3-시나리오-scenario)
4. [아이템 / 캐릭터 / 시나리오 카테고리](#4-아이템--캐릭터--시나리오-카테고리)
5. [스킬 / 액션 / 시나리오 타입](#5-스킬--액션--시나리오-타입)
6. [디바이스 / 환자 의상·포즈](#6-디바이스--환자-의상포즈)
7. [검사 / 문진 / 증상](#7-검사--문진--증상)
8. [기관 / 게시글 / 국가](#8-기관--게시글--국가)
9. [커리큘럼](#9-커리큘럼-curriculum)
10. [라이센스](#10-라이센스-license)
11. [클래스](#11-클래스-class)
12. [프로덕트](#12-프로덕트-product)
13. [기타](#13-기타)

---

## 공통

- **Base URL**: `REACT_APP_API_BASE_URL` (예: `http://localhost:3001/api`)
- **인증**: 대부분 API는 `Authorization: Bearer {accessToken}` 필요 (일부 공개 API 제외)
- **Content-Type**: `application/json` (멀티파트 업로드 제외)

---

## 1. 인증 (Authentication)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/auth/access-token` | 리프레시 토큰으로 액세스 토큰 재발급 | - |
| POST | `/auth/send-verification-email` | 인증 메일 발송 | Bearer |
| POST | `/auth/verify-verification-code` | 이메일 인증 코드 검증 | Bearer |
| POST | `/auth/password-reset` | 비밀번호 재설정 요청 | - |
| POST | `/auth/send-deletion-code` | 계정 삭제 인증 코드 메일 발송 | Bearer |
| POST | `/auth/verify-deletion-code` | 계정 삭제 인증 코드 검증 | Bearer |

---

## 2. 유저 (User)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/user/signup` | 회원가입 | - |
| POST | `/user/login` | 로그인 (액세스/리프레시 토큰 발급) | - |
| GET | `/user/profile` | 유저 프로필 조회 | Bearer |
| PATCH | `/user/profile` | 유저 프로필 변경 | Bearer |
| GET | `/user/regular-member/list` | 기관이 없는 정회원 리스트 조회 (page, pageSize, search) | Bearer |
| POST | `/user/organization-member/list` | 기관별 정회원 리스트 등록 | Bearer |
| POST | `/user/check-email` | 이메일 중복 확인 | - |
| POST | `/user/check-login-id` | 로그인 ID 중복 확인 | - |
| POST | `/user/status/list` | 유저 상태 전환 (활성/비활성) | Bearer |
| PATCH | `/user/role/admin` | 슈퍼관리자용 유저 권한 변경 (0~5) | Bearer |
| PATCH | `/user/role/organization` | 기관관리자용 유저 권한 변경 (1~2) | Bearer |
| DELETE | `/user/list` | 유저 삭제 | Bearer |
| GET | `/user/all/count` | 전체 유저 수 조회 | Bearer |
| GET | `/user/option/list` | 조건별 유저 리스트 (page, pageSize, search, role, isActive, type) | Bearer |
| GET | `/user/organization/{organizationId}/list` | 기관별 유저 리스트 (organizationId, page, pageSize) | Bearer |
| GET | `/user/bulk-upload-template` | 유저 일괄 등록 템플릿 다운로드 | Bearer |
| POST | `/user/bulk-create` | 유저 일괄 생성 (게스트, multipart/form-data, 유효기간 기본 30일·설정 가능, 만료 시 계정 비활성화) | Bearer |
| POST | `/user/export-excel` | 조건별 유저 리스트 엑셀 추출 | Bearer |
| POST | `/user/change-password` | 비밀번호 변경 (본인, resetToken 사용) | - |
| POST | `/user/change-password-admin` | 비밀번호 변경 (관리자) | Bearer |
| DELETE | `/user/my-account` | 회원 탈퇴 | Bearer |

---

## 3. 시나리오 (Scenario)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/scenario/list` | 본인이 생성한 시나리오 리스트 (page, pageSize) | Bearer |
| GET | `/scenario/{scenarioId}/detail` | 시나리오 상세 조회 | Bearer |
| POST | `/scenario` | 시나리오 생성 (CreateScenarioRequestDto) | Bearer |
| GET | `/scenario/{classId}/class` | 클래스별 시나리오 리스트 조회 | Bearer |
| GET | `/scenario/license` | 라이센스별 시나리오 리스트 (라이센스·타입·시나리오명·저작기관명·내용 검색, organizationLicenseId, scenarioCategoryId, searchKeyword, page, pageSize) | Bearer |

---

## 4. 아이템 / 캐릭터 / 시나리오 카테고리

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/item/list/option` | 스킬·타입 별 아이템 리스트 (type 필수: MAP/CART/EQUIPMENT/CONSUMABLE/MEDICATION/EXPRESSION, skillId 선택) | Bearer |
| GET | `/character/list` | 캐릭터 리스트 (type 선택: NPC/PATIENT) | Bearer |
| GET | `/scenario-category/list` | 시나리오 카테고리 리스트 (type 선택: JOP/SUBJECT/DEPARTMENT) | - |

---

## 5. 스킬 / 액션 / 시나리오 타입

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/action/list` | 스킬별 액션 리스트 (skillId 필수) | Bearer |
| GET | `/skill/category/list` | 스킬 카테고리 리스트 | Bearer |
| GET | `/skill/list` | 스킬 리스트 (skillCategoryId 선택) | Bearer |
| GET | `/scenario-type/list` | 시나리오 타입 리스트 | - |

---

## 6. 디바이스 / 환자 의상·포즈

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/device/type/list` | 디바이스 타입 리스트 | Bearer |
| POST | `/device/register` | 기기 등록 | Bearer |
| PUT | `/device/{organizationDeviceId}` | 기기 정보 변경 | Bearer |
| GET | `/patient-clothing/list` | 환자 의상 리스트 (type 선택: TOP/BOTTOM) | - |
| GET | `/pose/list` | 환자 포즈 리스트 (page, pageSize) | Bearer |

---

## 7. 검사 / 문진 / 증상

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/medical-test/category/list` | 검사 카테고리 리스트 | - |
| GET | `/medical-test/list` | 검사 카테고리 ID로 검사 리스트 (medicalTestCategoryId) | - |
| GET | `/medical-test/item/list` | 검사 ID로 검사 항목 리스트 (medicalTestId) | - |
| GET | `/patient-symptom/medical-department/list` | 진료과 리스트 | - |
| GET | `/patient-symptom/list` | 진료과별 증상 리스트 (medicalDepartmentId) | - |
| GET | `/patient-symptom/pattern/list` | 증상별 증상양상 리스트 (patientSymptomId) | - |
| GET | `/medical-question/list` | 문진 질문 리스트 | - |

---

## 8. 기관 / 게시글 / 국가

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/organization/type/list` | 기관 유형 리스트 | - |
| GET | `/organization/count` | 기관 수 조회 | Bearer |
| GET | `/organization/list` | 기관 리스트 (page, pageSize, search, licenseType, licenseStatus, countryId, startDate, endDate) | Bearer |
| GET | `/organization/{organizationId}/detail` | 기관 상세 조회 | Bearer |
| POST | `/organization` | 기관 생성 | Bearer |
| PUT | `/organization/{organizationId}` | 기관 수정 | Bearer |
| DELETE | `/organization/{organizationId}` | 기관 삭제 | Bearer |
| POST | `/organization-post` | 기관 게시글 생성 (기관 소속 사용자만 가능, body: content 필수, fileUrl 선택) | Bearer |
| GET | `/organization-post/list` | 기관별 게시글 리스트 (organizationId, page, pageSize, 응답: postList, totalCount) | Bearer |
| PUT | `/organization-post/{organizationPostId}` | 기관 게시글 수정 (본인 작성 글만 가능) | Bearer |
| DELETE | `/organization-post/{organizationPostId}` | 기관 게시글 삭제 (본인 작성 글만 가능) | Bearer |
| GET | `/country/list` | 국가 리스트 | - |
| GET | `/country/calling-code/list` | 국가 전화 코드 리스트 | - |

---

## 9. 커리큘럼 (Curriculum)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/curriculum/list` | 커리큘럼 리스트 (page, pageSize) | Bearer |
| GET | `/curriculum/organization/list` | 기관별 커리큘럼 리스트 (organizationId, page, pageSize) | Bearer |
| POST | `/curriculum` | 커리큘럼 생성 (title, deviceType, scenarioIdList) | Bearer |
| PUT | `/curriculum/{curriculumId}` | 커리큘럼 수정 | Bearer |

---

## 10. 라이센스 (License)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/license` | 기관 라이센스 생성 | Bearer |
| GET | `/license/list` | 기관별 라이센스 리스트 (page, pageSize) | Bearer |
| PUT | `/license/{organizationLicenseId}` | 기관 라이센스 수정 | Bearer |
| DELETE | `/license/{organizationLicenseId}` | 기관 라이센스 삭제 | Bearer |
| GET | `/license/{organizationLicenseId}/usage` | 라이센스별 사용 내역 조회 | Bearer |
| POST | `/license/device` | 라이센스에 디바이스 등록 | Bearer |
| PUT | `/license/{organizationLicenseId}/device` | 라이센스에 등록된 디바이스 목록 변경 | Bearer |
| GET | `/license/{organizationId}/device` | 기관별 기기 리스트 (organizationId, page, pageSize) | Bearer |

---

## 11. 클래스 (Class)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/class` | 클래스 생성 | Bearer |
| GET | `/class/organization/list` | 기관별 클래스 리스트 (organizationId, startDate, endDate, isActive, title, page, pageSize) | Bearer |
| GET | `/class/{classId}` | 클래스 상세 조회 | Bearer |
| PUT | `/class/{classId}` | 클래스 수정 | Bearer |
| DELETE | `/class/{classId}` | 클래스 삭제 (Request body: classId) | Bearer |
| PUT | `/class/{classId}/password` | 클래스 비밀번호 변경 | Bearer |
| POST | `/class/{classId}/enroll` | 클래스 수강신청 | Bearer |
| POST | `/class/{classId}/device/{organizationDeviceId}` | 클래스 디바이스 등록 | Bearer |

---

## 12. 프로덕트 (Product)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/product` | 프로덕트 생성 | Bearer |
| GET | `/product/list` | 프로덕트 리스트 (page, pageSize) | Bearer |
| GET | `/product/{productId}` | 프로덕트 상세 조회 | Bearer |
| PUT | `/product/{productId}` | 프로덕트 수정 | Bearer |
| DELETE | `/product/{productId}` | 프로덕트 삭제 | Bearer |

---

## 13. 기타

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/terms/list` | 이용약관 리스트 조회 | - |
| GET | `/scenario-thumbnail-image/list` | 시나리오 타입별 썸네일 이미지 리스트 (scenarioTypeId) | - |
| POST | `/file/presigned-url` | 파일 업로드용 Pre-signed URL 생성 (fileType, fileName, uploadPath: CREATOR/USER/EDU) | - |
| GET | `/enum` | Enum 리스트 조회 (나이단위, 혈액형, 캐릭터타입 등) | - |
| GET | `/scenario-play-record` | 시나리오 플레이 기록 조회 (MongoDB 저장 기록, userId, classId, classUserId, scenarioId, page 기본 1, pageSize 기본 20) | - |
| GET | `/health` | 헬스 체크 | - |

---

## 스키마 참조 (요청/응답 DTO)

요청·응답 본문 및 쿼리 파라미터 상세는 OpenAPI 스펙의 `components.schemas`를 참고하세요.  
`openapi.json`에 기관 게시글·시나리오 리스트 등 일부 스키마가 정의되어 있으며, 백엔드 Swagger에서 내려주는 전체 스펙에는 모든 DTO가 포함됩니다.

- **인증/유저**: `LoginDto`, `LoginResponseDto`, `SignupRequestDto`, `SignupResponseDto`, `UserProfileResponseDto`, `GetUserListWithFiltersResponseDto` 등
- **시나리오**: `CreateScenarioRequestDto`, `GetScenarioDetailResponseDto`, `GetScenarioListByUserIdResponseDto`, `GetScenarioListByLicenseResponseDto`, `ScenarioItemDto` 등
- **기관**: `CreateOrganizationRequestDto`, `GetOrganizationDetailResponseDto` 등
- **기관 게시글**: `CreateOrganizationPostRequestDto`, `CreateOrganizationPostResponseDto`, `OrganizationPostDto`, `GetOrganizationPostListResponseDto`, `UpdateOrganizationPostRequestDto` 등
- **커리큘럼**: `CreateCurriculumRequestDto`, `GetCurriculumListResponseDto` 등
- **클래스**: `CreateClassRequestDto`, `GetClassDetailResponseDto` 등
- **라이센스**: `CreateLicenseRequestDto`, `GetLicenseListResponseDto` 등

---

**문서 위치**: `my-app/docs/api/API.md`  
**정규 스펙**: `my-app/docs/api/openapi.json`
