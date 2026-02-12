# 스크린샷 생성

Student 사용자 페이지 스크린샷을 자동으로 생성합니다.

## 사전 요구사항

1. **앱 실행**: 다른 터미널에서 `npm start`로 앱을 실행해 두세요 (기본: http://localhost:3000).
2. **Playwright Chromium 설치** (최초 1회):
   ```bash
   npx playwright install chromium
   ```

## 실행 방법

```bash
npm run screenshot:student
```

또는 포트가 다르면:

```bash
BASE_URL=http://localhost:3001 npm run screenshot:student
```

## 캡처되는 페이지

| 순서 | 경로 | 파일명 |
|------|------|--------|
| 1 | /student/dashboard | 01-dashboard.png |
| 2 | /open-class-list | 02-open-class-list.png |
| 3 | /student/my-classes | 03-my-classes.png |
| 4 | /student/my-classes/001 | 04-my-class-detail.png |
| 5 | /student/cart | 05-cart.png |
| 6 | /student/orders | 06-orders.png |
| 7 | /open-class/001 | 07-open-class-detail.png |

## 저장 위치

`my-app/screenshots/student/` 폴더에 전체 페이지 스크린샷이 저장됩니다.

## 참고

- 스크립트는 localStorage에 mock student 사용자를 설정한 뒤 각 페이지를 방문해 캡처합니다.
- 로그인 화면 없이 student 권한으로 각 페이지가 렌더된 상태를 캡처합니다.
