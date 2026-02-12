# 개발 브랜치 규칙 (엄격)

## 개발 작업 브랜치

- **앞으로 모든 개발 작업은 `dev-cdh` 브랜치에서 진행한다.**
- 코드 수정, 기능 추가, 버그 수정 등은 `dev-cdh`를 체크아웃한 상태에서만 수행한다.
- `dev-cdh`는 `develop`을 베이스로 한 개발 브랜치이다.

## 체크아웃 및 동기화

```bash
git fetch origin
git checkout dev-cdh
git pull origin dev-cdh
```

## PR/머지

- 작업 완료 시 `dev-cdh` → `develop` (또는 정해진 타깃 브랜치)로 Pull Request 생성 후 머지한다.
