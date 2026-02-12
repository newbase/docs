# Student 마이클래스 목록 — 백엔드 기능 정의

**대상 화면**: Student 마이클래스 목록 (`/student/my-classes`)  
**목적**: 백엔드 개발자가 목록 API·데이터·권한·비즈니스 규칙을 구현할 때 참고하는 기능 정의서.

---

## 1. 화면 요약

| 항목 | 내용 |
|------|------|
| **경로** | `/student/my-classes` (Student), `/master/my-classes` (Master 동일 구조) |
| **역할** | Student, Master (본인 수강 클래스만) |
| **주요 동작** | 내가 수강 중인 클래스 카드 목록 조회, 상태별 필터, 카드 클릭 시 상세 이동, 초대코드 등록 |

---

## 2. API 명세

### 2.1 내 수강 클래스 목록 조회 (신규 API 권장)

**현재 프론트 동작**:  
기관별 클래스 전체(`GET /class/organization/list`) + 클라이언트 localStorage(`myClassStatus`, `participatingClasses`)로 “내 클래스”를 필터링하고 있음.  
→ **백엔드에서 “내 수강 클래스” 전용 API 제공 시** 단일 호출로 목록·상태·페이지네이션 처리 가능.

| 항목 | 내용 |
|------|------|
| **메서드·경로** | `GET /class/my-list` 또는 `GET /enrollment/my-classes` (팀 네이밍 규칙에 따름) |
| **인증** | 필수. Bearer Token. 요청 사용자 = 수강 대상(Student/Master). |
| **권한** | Student, Master만 호출 가능. Admin은 불가(다른 API 사용). |

#### Request (Query Parameters)

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | number | N | 1 | 페이지 번호 |
| `pageSize` | number | N | 6 | 페이지당 건수 (화면 기본 6) |
| `status` | string | N | all | 목록 필터: `all` \| `eligible` \| `participating` \| `completed` \| `ended` |

- **status**  
  - `all`: 전체  
  - `eligible`: 참여가능(등록만 됨, 미시작)  
  - `participating`: 참여중(진행 중)  
  - `completed`: 이수완료  
  - `ended`: 종료(수강기간 만료. `participationPeriod.endDate < 오늘` 기준)

#### Response (200 OK)

```ts
{
  "list": MyClassListItemDto[],
  "totalCount": number
}
```

#### MyClassListItemDto (목록 1건)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `classId` | number | Y | 클래스 ID (상세 링크 등에 사용) |
| `title` | string | Y | 클래스명 |
| `description` | string | N | 클래스 설명 |
| `thumbnailUrl` | string | N | 썸네일 URL |
| `participationPeriod` | object | Y | 수강기간 |
| `participationPeriod.startDate` | string | Y | ISO 8601 또는 YYYY-MM-DD |
| `participationPeriod.endDate` | string | Y | ISO 8601 또는 YYYY-MM-DD |
| `enrollmentStatus` | string | Y | 서버 저장 상태: `eligible` \| `participating` \| `completed` |
| `curriculumCount` | number | N | 커리큘럼(시나리오) 수 (카드에 “세션 수” 표시) |
| `duration` | string | N | 예상 소요시간 (예: "2시간 30분") |
| `isPrivate` | boolean | N | 비공개 클래스 여부 (자물쇠 아이콘 표시용) |

- **enrollmentStatus**  
  - 클라이언트는 `participationPeriod.endDate`와 비교해 **수강기간 만료 시** 표시만 `ended`로 바꿔서 사용 가능.  
  - 서버는 저장된 3가지만 반환: `eligible` / `participating` / `completed`.

#### 에러 응답

| HTTP | 상황 |
|------|------|
| 401 | 미인증 |
| 403 | 권한 없음(예: Admin이 이 API 호출) |

---

## 3. 비즈니스 규칙

### 3.1 “내 수강 클래스” 범위

다음에 해당하는 클래스만 목록에 포함한다.

- (주문 완료 등으로) **수강 등록(enrollment)** 이 생성된 클래스  
- **초대 수락**으로 참여가 등록된 클래스  
- (정책에 따라) **기관·라이선스**로 자동 등록된 클래스  

→ 백엔드에서 “수강(enrollment)” 테이블/도메인 기준으로 **현재 사용자 + classId** 조인해 목록 생성.

### 3.2 표시 상태(displayStatus) 규칙

| 저장값 (enrollmentStatus) | 수강기간 | 화면 표시 |
|----------------------------|----------|-----------|
| eligible | 기간 내 | 참여가능 |
| eligible | 만료 | 종료 |
| participating | 기간 내 | 참여중 |
| participating | 만료 | 종료 |
| completed | 기간 내 | 이수완료 |
| completed | 만료 | 종료 |

- **ended(종료)** 는 `participationPeriod.endDate < 오늘` 이면 클라이언트에서 표시만 “종료”로 처리해도 됨.  
- **status 쿼리** `ended` 로 필터 시: 서버는 `participationPeriod.endDate < 오늘` 인 수강만 반환하면 됨.

### 3.3 상태 값 정의

| 값 | 의미 |
|----|------|
| eligible | 수강 등록됨(주문/초대/기관 등록). 아직 “세션 시작” 전. |
| participating | 최소 1회 세션 참여 또는 “세션 시작” 처리됨. 이수 조건 미달. |
| completed | 이수 조건 충족(최소 시나리오 수, 최소 점수 등). 이수증 다운로드 가능. |

(이수 조건은 클래스 설정·상세 API 스펙에 따름.)

---

## 4. 페이지네이션·정렬

| 항목 | 규칙 |
|------|------|
| **페이지네이션** | `page`, `pageSize` 지원. 기본 `pageSize=6` (UI 카드 6개). |
| **정렬** | 명시 없음. 기본 정렬 권장: 수강기간 시작일 내림차순 또는 최근 참여일 내림차순. |

---

## 5. 통계(선택)

화면 상단 “참여중인 클래스 N개” 요약용.

- **참여중인 클래스 수**:  
  `enrollmentStatus = participating` 이고  
  `participationPeriod.startDate <= 오늘 <= participationPeriod.endDate` 인 건수.

- **제공 방식**:  
  - 목록 API 응답에 `summary.activeCount` 등으로 포함하거나,  
  - 별도 `GET /class/my-list/summary` 등으로 제공.

---

## 6. 연관 API·플로우

| 플로우 | 연동 |
|--------|------|
| **초대코드 등록** | 초대 수락 API 호출 후, 해당 클래스가 “내 수강 클래스”에 등록됨 → 목록 API에 새 항목 포함. |
| **주문 완료** | 주문 완료 시 수강 등록 생성 → 목록 API에 새 항목 포함. |
| **마이클래스 상세** | 목록의 `classId`로 상세 조회 `GET /class/{classId}` (기존 API) 호출. |

---

## 7. 현재 프론트 데이터 소스(참고)

- **목록 소스**: `useClasses(organizationId)` → `GET /class/organization/list` + localStorage로 “내 클래스” 필터.
- **상태 소스**: `myClassStatus`(eligible/participating/completed), `participatingClasses` (localStorage).
- **전환 시**: 백엔드에서 `GET /class/my-list`(또는 동일 역할 API) 제공 시, 프론트는 해당 API 1회 호출로 교체하고 localStorage 기반 “내 클래스” 필터는 제거 가능.

---

## 8. 체크리스트 (백엔드 구현 시)

- [ ] 수강(enrollment) 도메인·테이블 존재 여부 및 “내 수강 클래스” 조회 가능 여부
- [ ] `GET /class/my-list` (또는 동일 역할) 엔드포인트 및 쿼리 파라미터(`page`, `pageSize`, `status`) 구현
- [ ] 응답 DTO에 `participationPeriod`, `enrollmentStatus`, `curriculumCount`, `isPrivate` 등 목록·카드 표시에 필요한 필드 포함
- [ ] `status=ended` 시 수강기간 만료만 필터
- [ ] 인증·역할 검증(Student/Master만 허용)
- [ ] (선택) 목록 응답에 `activeCount` 등 요약 필드 포함 또는 별도 요약 API
