# web-service

플랫폼 운영시스템 : Admin, Student, Master, Studio 서비스

## 프로젝트 개요

Medicrew Platform의 웹 서비스 애플리케이션입니다. React 기반으로 구축되었으며, 역할 기반 접근 제어(RBAC)를 통해 Admin, Student, Master, Studio 기능을 제공합니다.

## 기술 스택

- **Frontend**: React 19, TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Build Tool**: Create React App + CRACO (Path Alias 지원)

## 프로젝트 구조

```
my-app/
├── src/
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   └── shared/           # 공유 컴포넌트 (Path Alias: @/components/shared)
│   │       ├── ui/           # UI 컴포넌트 (Button, Modal, Card, Badge, Input, Select 등)
│   │       ├── layout/       # 레이아웃 컴포넌트 (Gnb, Footer, CommonLayout, Breadcrumbs 등)
│   │       ├── common/       # 공통 컴포넌트 (Loading, ErrorBoundary)
│   │       └── email/        # 이메일 템플릿 (VerificationEmailTemplate, PasswordResetEmailTemplate 등)
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── auth/             # 인증 관련 페이지
│   │   ├── dashboard/        # 대시보드 페이지
│   │   ├── class/            # 클래스 관리 페이지
│   │   ├── scenario/         # 시나리오 페이지
│   │   ├── studio/           # Studio 편집기 페이지
│   │   ├── assets/           # 에셋 관리 페이지
│   │   ├── organization/     # 조직 관리 페이지
│   │   ├── users/            # 사용자 관리 페이지
│   │   └── dev/              # 개발용 페이지 (EmailPreview 등)
│   ├── routes/               # 라우트 설정 및 가드
│   │   ├── config/           # 라우트 설정 (adminRoutes, masterRoutes, studentRoutes)
│   │   ├── guards/           # 라우트 가드 (RequireRole, RequireFeature, RequirePremium, RequirePermission)
│   │   ├── layouts/          # 레이아웃 컴포넌트 (AuthLayout, AppLayout, AdminLayout)
│   │   └── pages/            # 공통 페이지 (ErrorPages: 404, 403, Upgrade)
│   ├── lib/                  # 라이브러리 및 유틸리티
│   │   ├── constants/        # 상수 (routes.ts: 모든 경로 상수)
│   │   └── cn.ts             # className 유틸리티 (clsx + tailwind-merge)
│   ├── config/               # 설정 파일
│   │   ├── featureFlags.ts   # Feature Flag 설정
│   │   └── menuConfig.ts     # 메뉴 설정
│   ├── contexts/             # React Context
│   │   └── AuthContext.tsx   # 인증 컨텍스트
│   ├── data/                 # 데이터 레이어
│   │   ├── mock/             # 목업 데이터
│   │   └── queries/          # API 훅 (useClasses, useDashboard 등)
│   ├── hooks/                # 커스텀 훅
│   │   └── use-toast.ts      # Toast 알림 훅
│   └── utils/                # 유틸리티 함수
│       ├── roleUtils.ts      # 역할 관련 유틸리티
│       ├── studioUtils.ts    # Studio 관련 유틸리티
│       └── eventUtils.ts     # 이벤트 관련 유틸리티
├── craco.config.js           # CRACO 설정 (Path Alias 지원)
└── tsconfig.json             # TypeScript 설정 (Path Alias 정의)
```

### Path Alias

프로젝트는 TypeScript Path Alias를 사용하여 import 경로를 단순화합니다:

- `@/components/shared/*` → `src/components/shared/*`
- `@/lib/*` → `src/lib/*`
- `@/pages/*` → `src/pages/*`
- `@/routes/*` → `src/routes/*`
- `@/config/*` → `src/config/*`
- `@/contexts/*` → `src/contexts/*`
- `@/data/*` → `src/data/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

예시:
```typescript
// Before (상대 경로)
import { Button } from '../../components/shared/ui';
import VerificationEmailTemplate from '../../components/email/VerificationEmailTemplate';

// After (Path Alias)
import { Button } from '@/components/shared/ui';
import { VerificationEmailTemplate } from '@/components/shared/email';
```

## 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

```bash
cd my-app
npm install --legacy-peer-deps
```

**참고**: TypeScript 버전 충돌로 인해 `--legacy-peer-deps` 플래그가 필요할 수 있습니다.

### 개발 서버 실행

```bash
npm start
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 빌드

```bash
npm run build
```

프로덕션 빌드가 `build` 폴더에 생성됩니다.

### 테스트

```bash
npm test
```

## 브랜치 전략

### 기본 브랜치

- **main**: 항상 배포 가능한 안정 버전 (프로덕션)
- **develop**: 다음 릴리즈 후보 (개발 통합 브랜치) - 테스트 서버에 자동 배포
- **dev-cdh**: **개발 작업 브랜치** — 앞으로 모든 개발 작업은 이 브랜치에서 진행 (베이스: develop)
- **ux-design**: 디자인 프리뷰

### Feature 브랜치

프로젝트는 Feature별로 독립적인 브랜치에서 개발됩니다. 각 Feature는 `feature/[번호]-[이름]` 형식을 따릅니다.

| 브랜치 | Feature | 우선순위 | 상태 |
|--------|---------|----------|------|
| `feature/1-auth` | 인증/인가 시스템 | 🔴 높음 | 🔄 기본 구조 완료 |
| `feature/2-dashboard` | 대시보드 | 🔴 높음 | 🔄 API 호출 구조 완료 |
| `feature/3-class-management` | 클래스 관리 | 🔴 높음 | 🔄 진행 중 |
| `feature/4-scenario-management` | 시나리오 관리 | 🟡 중간 | 📋 계획됨 |
| `feature/5-studio-editor` | Studio 편집기 | 🔴 높음 | 🔄 진행 중 |
| `feature/6-asset-management` | 에셋 관리 | 🟡 중간 | 🔄 진행 중 |
| `feature/7-organization-management` | 조직 관리 | 🔴 높음 | 🔄 진행 중 |
| `feature/8-user-management` | 사용자 관리 | 🔴 높음 | 🔄 진행 중 |
| `feature/9-device-management` | 디바이스 관리 | 🟡 중간 | 🔄 진행 중 |
| `feature/11-security` | 보안 강화 | 🟡 중간 | 📋 계획됨 |
| `feature/12-performance` | 성능 최적화 | 🟢 낮음 | 📋 계획됨 |
| `feature/13-testing` | 테스트 | 🟡 중간 | 📋 계획됨 |
| `feature/14-documentation` | 문서화 및 운영 | 🟢 낮음 | 📋 계획됨 |

> **참고**: 각 Feature의 상세 백로그는 [.github/BACKLOG.md](.github/BACKLOG.md)를 참조하세요.

### 브랜치 워크플로우

1. **개발 브랜치 체크아웃** (개발 작업은 `dev-cdh`에서 진행)
   ```bash
   git checkout dev-cdh
   git pull origin dev-cdh
   ```
   Feature 브랜치를 쓸 경우:
   ```bash
   git checkout dev-cdh
   git pull origin dev-cdh
   git checkout -b feature/7-organization-management
   ```

2. **개발 및 커밋**
   ```bash
   # 작업 후 커밋
   git add .
   git commit -m "feat: 조직 관리 기능 추가"
   ```

3. **원격 저장소에 푸시**
   ```bash
   git push origin feature/7-organization-management
   ```

4. **Pull Request 생성**
   - GitHub에서 `feature/7-organization-management` → `develop` PR 생성
   - PR 템플릿 작성 및 리뷰 요청

5. **리뷰 및 머지**
   - 최소 1명의 승인 후 `develop` 브랜치로 머지
   - 머지 후 자동으로 테스트 서버에 배포

### 브랜치 네이밍 규칙

- **기능**: `feature/[번호]-[이름]` (예: `feature/7-organization-management`)
- **버그 수정**: `fix/<short-desc>` (예: `fix/login-error`)
- **핫픽스**: `hotfix/<short-desc>` (예: `hotfix/security-patch`)
- **릴리즈**: `release/<yyyy-mm-dd>` 또는 `release/<version>` (예: `release/2025-01-17`)

### 브랜치 보호 규칙

- `main` 브랜치: 직접 push 불가, PR을 통해서만 머지
- `develop` 브랜치: PR 리뷰 필수 (최소 1명 승인)
- Feature 브랜치: 자유롭게 push 가능

## 배포

### 자동 배포 (CI/CD)

프로젝트는 GitHub Actions를 통해 자동 배포를 지원합니다.

#### 테스트 서버 배포

`develop` 브랜치에 push되면 자동으로 AWS S3 테스트 서버에 배포됩니다.

**워크플로우**: `.github/workflows/deploy-test.yml`

**배포 프로세스**:
1. 코드 체크아웃
2. Node.js 환경 설정
3. 의존성 설치 (`npm install --legacy-peer-deps`)
4. 프로덕션 빌드 (`npm run build`)
5. AWS S3에 빌드 파일 업로드
6. CloudFront 캐시 무효화 (선택사항)

#### 필요한 GitHub Secrets 설정

배포를 위해 다음 GitHub Secrets를 설정해야 합니다:

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 액세스 키 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_S3_BUCKET` | 테스트 서버용 S3 버킷 이름 | `web-service-test` |
| `AWS_REGION` | AWS 리전 (선택사항, 기본값: ap-northeast-2) | `ap-northeast-2` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront 배포 ID (선택사항) | `E1234567890ABC` |

**GitHub Secrets 설정 방법**:
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 위의 Secret들을 각각 추가

#### AWS 리소스 설정

배포 전에 다음 AWS 리소스를 수동으로 생성해야 합니다:

**S3 버킷 설정**:
1. S3 버킷 생성 (예: `web-service-test`)
2. 정적 웹사이트 호스팅 활성화
3. 버킷 정책 설정 (퍼블릭 읽기 권한)
4. React Router를 위한 에러 페이지 설정:
   - 에러 문서: `index.html`
   - HTTP 에러 코드: `404`
   - 응답 페이지 경로: `index.html`
   - HTTP 응답 코드: `200`

**CloudFront 설정 (선택사항)**:
1. S3 버킷을 Origin으로 설정
2. 커스텀 에러 응답 설정:
   - HTTP 에러 코드: `404`
   - 응답 페이지 경로: `/index.html`
   - HTTP 응답 코드: `200`
3. HTTPS 강제 설정
4. 배포 ID를 GitHub Secrets에 추가

#### 수동 배포

수동으로 배포하려면:

```bash
cd my-app
npm install --legacy-peer-deps
npm run build
aws s3 sync build/ s3://your-bucket-name/ --delete
```

#### 환경 변수

테스트 서버 배포 시 환경 변수가 필요한 경우, 빌드 전에 `.env.test` 파일을 생성하거나 GitHub Secrets에 환경 변수를 추가하고 워크플로우에서 사용하도록 설정할 수 있습니다.

## 라우팅 구조

프로젝트는 다음과 같은 라우팅 구조를 사용합니다:

- **경로 상수화**: `lib/constants/routes.ts`에서 모든 경로 관리
- **라우트 가드**: `RequireRole`, `RequireFeature`, `RequirePremium`, `RequirePermission` 등
- **레이아웃 분리**: 
  - `AuthLayout`: 인증 페이지용 (GNB/Footer 없음)
  - `AppLayout`: 일반 사용자 페이지용 (max-w-7xl)
  - `AdminLayout`: Admin 페이지용 (max-w-[1600px])
- **Lazy Loading**: Admin, Master, Student 라우트에 lazy loading 적용
- **라우트 설정 분리**: `routes/config/`에서 라우트 설정과 컴포넌트 분리

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
REACT_APP_FEATURE_STUDIO_EDITOR=true
REACT_APP_FEATURE_COURSE_PLAYER_UI=true
REACT_APP_USE_MOCK_DATA=true
```

## Feature Flags

환경 변수를 통해 기능을 단계적으로 활성화할 수 있습니다:

- `FEATURE_STUDIO_EDITOR`: Studio 편집기 기능
- `FEATURE_COURSE_PLAYER_UI`: 코스 플레이어 UI
- `USE_MOCK_DATA`: 목업 데이터 사용 여부
- `ENABLE_EMAIL_PREVIEW`: 이메일 미리보기 (개발용)

자세한 내용은 `src/config/featureFlags.ts`를 참조하세요.

## 개발 가이드

### 컴포넌트 구조

#### Shared Components

프로젝트는 재사용 가능한 컴포넌트를 `components/shared/` 폴더에 구조화했습니다:

- **UI Components** (`components/shared/ui/`): 
  - 기본 컴포넌트: Button, Modal, Card, Badge, Input, Select 등
  - Radix UI 기반: Dialog, DropdownMenu, Tabs, Toast 등
  - 모든 컴포넌트는 `index.ts`를 통해 export됨
  
- **Layout Components** (`components/shared/layout/`): 
  - Gnb (Global Navigation Bar)
  - Footer
  - CommonLayout (maxWidth 옵션 지원)
  - Breadcrumbs, Lnb, ProfileMenu 등
  
- **Common Components** (`components/shared/common/`): 
  - Loading: 로딩 상태 표시
  - ErrorBoundary: 에러 경계 처리
  
- **Email Templates** (`components/shared/email/`): 
  - VerificationEmailTemplate: 이메일 인증 템플릿
  - PasswordResetEmailTemplate: 비밀번호 재설정 템플릿
  - EmailChangeEmailTemplate: 이메일 변경 템플릿

모든 shared 컴포넌트는 `@/components/shared/*` path alias를 통해 import합니다.

**Import 예시:**
```typescript
// 단일 컴포넌트
import { Button } from '@/components/shared/ui';
import { Gnb, Footer } from '@/components/shared/layout';
import { Loading } from '@/components/shared/common';
import { VerificationEmailTemplate } from '@/components/shared/email';

// 또는 root export 사용
import { Button, Modal, Card } from '@/components/shared';
```

#### 유틸리티

- **cn 함수** (`lib/cn.ts`): `clsx`와 `tailwind-merge`를 결합한 className 유틸리티
  ```typescript
  import { cn } from '@/lib/cn';
  
  <div className={cn('base-class', condition && 'conditional-class')} />
  ```

### 데이터 레이어

프로젝트는 데이터 레이어를 분리하여 관리합니다:

- **Mock Data** (`data/mock/`): 개발용 목업 데이터
  - `classes.ts`: 클래스 목업 데이터
  - `dashboard.ts`: 대시보드 목업 데이터
  
- **API Hooks** (`data/queries/`): 실제 API 호출 훅
  - `useClasses.ts`: 클래스 데이터 조회 훅
  - `useDashboard.ts`: 대시보드 데이터 조회 훅
  
- **Feature Flag 기반 전환**: `USE_MOCK_DATA` 환경 변수로 mock ↔ real 전환
  - 환경 변수에 따라 자동으로 mock 또는 real API 사용
  - UI 컴포넌트는 데이터 소스에 대해 알 필요 없음 (프레젠테이션 컴포넌트)

### 라우트 가드

프로젝트는 다양한 라우트 가드를 제공합니다:

- `RequireRole`: 역할 기반 접근 제어
- `RequireFeature`: Feature flag 기반 접근 제어
- `RequirePremium`: Premium 라이선스 기반 접근 제어
- `RequirePermission`: 권한 기반 접근 제어 (구현 예정)

사용 예시:
```typescript
<Route element={<RequireRole role="admin" />}>
  <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
</Route>
```

## PR 규칙

- PR 템플릿 사용 필수: 목적/스크린샷/테스트 방법/영향 범위/릴리즈 노트
- 최소 승인: 웹/백엔드 1명 승인

## 릴리즈/버전 규칙

- 태그: `vX.Y.Z` (SemVer)
- Conventional Commits 사용 권장
  - 예: `feat: add course enrollment flow`
  - 예: `fix: prevent duplicate submission`

## 보안 고려사항

1. **RBAC 모델**: Role(learner/master/admin) + Permission(기능 단위) + Tenant(기관)
2. **프론트엔드 권한 체크**: UX용이며, 실제 보안은 백엔드 API에서 검증
3. **Admin 분리**: Admin 코드/기능이 일반 사용자 번들에 섞이지 않도록 주의
4. **Audit Log**: Admin에서 권한 변경/코스 변경/콘텐츠 삭제 등 감사 로그 필수

## 문서

- [CONTRIBUTING.md](./CONTRIBUTING.md): 브랜치/커밋/PR 규칙
- [.github/pull_request_template.md](./.github/pull_request_template.md): PR 템플릿

## 라이선스

Private - All rights reserved
