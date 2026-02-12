# 설치 가이드 (Installation Guide)

**작성일**: 2026-01-23  
**프로젝트**: Medicrew Platform Web App

---

## 📦 필수 패키지 설치

### 1. Node.js 및 npm 버전 확인

```bash
node --version  # v18.x 이상 권장
npm --version   # v9.x 이상 권장
```

---

## 🚀 설치 방법

### 방법 1: 전체 설치 (권장)

프로젝트 루트 디렉토리에서 실행:

```bash
cd web-service/my-app
npm install
```

이 명령어는 `package.json`에 정의된 모든 의존성을 자동으로 설치합니다.

---

### 방법 2: 개별 패키지 설치

필요한 패키지만 선택적으로 설치:

```bash
# React Query (데이터 페칭)
npm install @tanstack/react-query@^5.90.19

# React Query DevTools (개발 도구, 개발 환경에서만)
npm install --save-dev @tanstack/react-query-devtools@^5.91.2

# Lucide React (아이콘)
npm install lucide-react@^0.555.0
```

---

## 📋 필수 의존성 (Dependencies)

### 핵심 라이브러리

| 패키지 | 버전 | 용도 | 필수 여부 |
|--------|------|------|----------|
| `react` | `^19.2.0` | React 프레임워크 | ✅ 필수 |
| `react-dom` | `^19.2.0` | React DOM 렌더링 | ✅ 필수 |
| `react-router-dom` | `^6.30.2` | 라우팅 | ✅ 필수 |
| `@tanstack/react-query` | `^5.90.19` | 데이터 페칭 및 캐싱 | ✅ 필수 |
| `lucide-react` | `^0.555.0` | 아이콘 라이브러리 | ✅ 필수 |

### UI 컴포넌트 라이브러리

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@radix-ui/react-dialog` | `^1.1.15` | 다이얼로그 컴포넌트 |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` | 드롭다운 메뉴 |
| `@radix-ui/react-select` | `^2.2.6` | 셀렉트 컴포넌트 |
| `@radix-ui/react-tabs` | `^1.1.13` | 탭 컴포넌트 |
| `@radix-ui/react-toast` | `^1.2.15` | 토스트 알림 |

### 스타일링

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `tailwindcss` | `^3.4.17` | CSS 프레임워크 |
| `tailwind-merge` | `^3.4.0` | Tailwind 클래스 병합 |
| `tailwindcss-animate` | `^1.0.7` | 애니메이션 유틸리티 |
| `class-variance-authority` | `^0.7.1` | 컴포넌트 variant 관리 |
| `clsx` | `^2.1.1` | 조건부 클래스명 |

### 개발 도구 (DevDependencies)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@tanstack/react-query-devtools` | `^5.91.2` | React Query 개발 도구 |
| `typescript` | `^5.9.3` | TypeScript 컴파일러 |
| `@craco/craco` | `^7.1.0` | Create React App 설정 오버라이드 |
| `autoprefixer` | `^10.4.23` | CSS 자동 접두사 |
| `postcss` | `^8.5.6` | CSS 후처리기 |

---

## 🔧 설치 후 확인

### 1. 설치 확인

```bash
npm list --depth=0
```

주요 패키지가 정상적으로 설치되었는지 확인:

```bash
npm list @tanstack/react-query lucide-react react react-dom
```

### 2. 프로젝트 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속 확인

---

## ⚠️ 문제 해결

### 문제 1: 패키지 버전 충돌

```bash
# node_modules 및 package-lock.json 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제 2: React Query 버전 불일치

현재 프로젝트는 **React Query v5**를 사용합니다.

```bash
# v5로 업그레이드 (필요시)
npm install @tanstack/react-query@^5.90.19
```

### 문제 3: TypeScript 에러

```bash
# TypeScript 재설치
npm install --save-dev typescript@^5.9.3
```

---

## 📝 최신 추가된 패키지 (2026-01-23)

다음 작업에서 사용된 패키지들은 **이미 설치되어 있습니다**:

### ✅ 추가 설치 불필요

- `lucide-react@^0.555.0` - Toast, FilterBar, DataTable 등에서 아이콘 사용
- `@tanstack/react-query@^5.90.19` - 데이터 페칭 및 캐싱
- `@tanstack/react-query-devtools@^5.91.2` - 개발 도구 (devDependencies)

### ❌ 설치하지 않은 패키지

- `date-fns` - **사용하지 않음** (Native JavaScript `Date` API 사용)

---

## 📦 패키지 설치 명령어 (고객용)

### 전체 설치 (권장)

```bash
cd web-service/my-app
npm install
```

### 필수 패키지만 설치

```bash
cd web-service/my-app

# 핵심 라이브러리
npm install react@^19.2.0 react-dom@^19.2.0 react-router-dom@^6.30.2

# 데이터 페칭
npm install @tanstack/react-query@^5.90.19

# 아이콘
npm install lucide-react@^0.555.0

# 개발 도구 (선택)
npm install --save-dev @tanstack/react-query-devtools@^5.91.2
```

### 설치 확인

```bash
# 전체 패키지 확인
npm list --depth=0

# 주요 패키지 확인
npm list react react-dom @tanstack/react-query lucide-react
```

**예상 설치 시간**: 약 2-5분 (인터넷 속도에 따라 다름)

---

## 🔄 업데이트 이력

| 날짜 | 변경 사항 |
|------|----------|
| 2026-01-23 | React Query v5 전역 설정 추가 |
| 2026-01-23 | Toast 알림 시스템 추가 (lucide-react 사용) |
| 2026-01-23 | DataTable, FilterBar 컴포넌트 추가 (lucide-react 사용) |

---

## 📚 참고 문서

- [React Query v5 문서](https://tanstack.com/query/latest)
- [Lucide React 아이콘](https://lucide.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 💡 설치 체크리스트

- [ ] Node.js v18+ 설치 확인
- [ ] `npm install` 실행 완료
- [ ] `npm start`로 프로젝트 실행 확인
- [ ] 브라우저 콘솔에 에러 없음 확인
- [ ] React Query DevTools 정상 작동 확인

---

**문의**: 설치 중 문제가 발생하면 개발팀에 문의해주세요.
