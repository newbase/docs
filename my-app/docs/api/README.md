# API 문서 (통합)

백엔드 **Scenario Studio API** 통합 문서입니다.

| 문서 | 설명 |
|------|------|
| **[API.md](./API.md)** | **통합 API 참조** – 모든 엔드포인트를 태그별로 정리한 단일 문서 |
| **[FRONTEND_API_INTEGRATION_PHASES.md](./FRONTEND_API_INTEGRATION_PHASES.md)** | **API 미연동 Phase별 연동 지시** – 화면·백엔드는 있는데 프론트 미호출 API를 Phase 1~4로 나누어 연동 작업 지시 |
| **openapi.json** | OpenAPI 3.0 정규 스펙 (백엔드 배포 시 제공되는 전체 스펙으로 교체 가능) |

## 사용 방법

- 프론트엔드 연동 시: [API.md](./API.md)에서 경로·메서드·파라미터 확인
- 코드/타입 생성: 백엔드에서 제공하는 `openapi.json` 또는 Swagger URL 사용

## 이전 문서 참조 정리

과거 코드에서 아래와 같이 분리된 문서를 참조하던 경우, **이 폴더의 `API.md`** 로 통합되었습니다.

- `API_백엔드_업데이트_최신.md`
- `API_최신화_백엔드_요청_반영.md`
- `USER_API_ENDPOINTS.md`

**최종 갱신**: 2026-02-10
