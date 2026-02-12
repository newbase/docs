# GitHub에 올리는 방법 (web-service)

## 현재 상태
- **원격 저장소**: `git@github.com:newbase/web-service.git` (이미 연결됨)
- **현재 브랜치**: `ux-design`

---

## 1. 문서만 커밋해서 GitHub에 올리기

### 1단계: 올릴 파일 스테이징

```bash
cd /Users/sunny/projects/web-service

# 백엔드 워크플로우 문서만 추가
git add docs/backend-workflow-index.html
git add docs/backend-workflow-student.html
git add docs/backend-workflow-master.html
git add docs/backend-workflow-admin.html
git add docs/backend-workflow-flows.html
git add docs/backend-workflow-flows-student.html
git add docs/backend-workflow-flows-master.html
git add docs/backend-workflow-flows-admin.html

# 수정된 문서도 포함하려면
git add docs/backend-workflow-student.html
```

한 번에 추가하려면:

```bash
git add docs/backend-workflow*.html docs/backend-workflow-flows*.html
```

### 2단계: 커밋

```bash
git commit -m "docs: 백엔드 워크플로우 문서 추가 (Student/Master/Admin)"
```

### 3단계: GitHub에 푸시

```bash
# ux-design 브랜치에 올리기
git push origin ux-design
```

다른 브랜치에 올리려면:

```bash
git checkout main
git merge ux-design
git push origin main
```

---

## 2. GitHub Pages로 웹 링크 공유하기

푸시한 뒤 문서를 **웹 주소**로 공유하려면 GitHub Pages를 켜면 됩니다.

### 2-1. 저장소에서 설정

1. 브라우저에서 **https://github.com/newbase/web-service** 접속
2. 상단 메뉴 **Settings** 클릭
3. 왼쪽에서 **Pages** 클릭
4. **Build and deployment**에서:
   - **Source**: `Deploy from a branch`
   - **Branch**: `ux-design` (또는 올려둔 브랜치) 선택
   - **Folder**: `/docs` 선택
   - **Save** 클릭

### 2-2. 공유할 URL

저장 후 1~2분 지나면 아래 주소로 접속됩니다.

- **진입 페이지**:  
  `https://newbase.github.io/web-service/backend-workflow-index.html`
- **Student**:  
  `https://newbase.github.io/web-service/backend-workflow-student.html`
- **Master**:  
  `https://newbase.github.io/web-service/backend-workflow-master.html`
- **Admin**:  
  `https://newbase.github.io/web-service/backend-workflow-admin.html`

> **참고**: GitHub Pages는 보통 `main` 또는 `master` 브랜치를 많이 씁니다. `ux-design`만 사용 중이면 위처럼 해당 브랜치를 선택하면 됩니다.

---

## 3. 처음부터 새 저장소에 올리는 경우

이 프로젝트가 아직 GitHub에 없다면:

### 3-1. GitHub에서 저장소 만들기

1. **https://github.com/new** 접속 후 로그인
2. **New repository** 클릭
3. **Repository name**: `web-service` (원하는 이름)
4. Public 선택 후 **Create repository** 클릭

### 3-2. 로컬과 연결 후 푸시

```bash
cd /Users/sunny/projects/web-service

# 이미 origin이 있으면 변경할 때만
git remote add origin https://github.com/newbase/web-service.git
# 또는 SSH: git remote add origin git@github.com:newbase/web-service.git

git branch -M main
git push -u origin main
```

---

## 4. 자주 쓰는 명령어 정리

| 하려는 것 | 명령어 |
|-----------|--------|
| 변경 파일 확인 | `git status` |
| 파일 추가 | `git add docs/파일명` 또는 `git add .` |
| 커밋 | `git commit -m "메시지"` |
| 푸시 | `git push origin 브랜치이름` |
| 최신 받기 | `git pull origin 브랜치이름` |

---

## 5. 이미지/스크린샷이 안 보일 때

문서에서 `../screenshots/` 같은 **상대 경로**로 이미지를 쓰고 있다면, GitHub Pages에서는 **docs 기준**으로 경로가 바뀝니다.

- 현재: `../screenshots/student-0212/01-dashboard.png`
- Pages 루트가 `docs`일 때: `screenshots/`가 `docs` 안에 있어야 함

이미지가 `docs` 밖에 있다면 다음 중 하나로 맞추면 됩니다.

1. **screenshots를 docs 안으로 복사**  
   예: `docs/screenshots/` 에 두고, HTML에서는 `screenshots/student-0212/01-dashboard.png` 로 참조
2. **HTML 경로 수정**  
   Pages 배포 구조에 맞게 이미지 경로를 `screenshots/...` 형태로 수정

이렇게 하면 GitHub에 올리고, 같은 문서를 웹 링크로 공유할 수 있습니다.
