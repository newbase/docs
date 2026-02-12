# 문서 목록 (Documentation Index)

**작성일**: 2026-01-23  
**프로젝트**: Medicrew Platform Web App

---

## 📚 문서 구조

```
docs/
├── api/                 # 백엔드 API 통합 문서
│   ├── README.md        # API 문서 안내
│   ├── API.md           # 통합 API 참조 (엔드포인트 정리)
│   └── openapi.json     # OpenAPI 3.0 스펙 (요약)
└── guides/              # 사용 가이드 (고객용)
    └── installation.md  # 설치 가이드
```

> **참고**: 개발자용 문서는 `.rules/` 폴더에 있습니다.

---

## 📖 API 문서 (개발자용)

### [API 통합 참조](./api/API.md)
Scenario Studio 백엔드 API 엔드포인트 통합 문서 (인증, 유저, 시나리오, 기관, 커리큘럼, 라이센스, 클래스, 프로덕트 등)

### [API 문서 폴더](./api/README.md)
OpenAPI 스펙 및 이전 분리 문서 참조 정리

---

## 📖 가이드 문서 (Guides)

### [설치 가이드](./guides/installation.md)
프로젝트 설치 및 패키지 관리 가이드

---

## 📝 문서 작성 규칙

1. **명명 규칙**: kebab-case 사용 (예: `installation.md`)
2. **위치**: 고객용 문서는 `docs/` 폴더에, 개발자용 문서는 `.rules/` 폴더에 분류
3. **업데이트**: 문서 수정 시 최종 수정일 업데이트

---

**최종 업데이트**: 2026-02-10
