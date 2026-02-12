# newbase/docs 저장소 설정 가이드

새 저장소 **https://github.com/newbase/docs** 에 문서(docs)와 스크린샷(screenshots)만 올리고 GitHub Pages로 공개하는 방법입니다.

---

## 1. web-service에서 새 원격 추가

```bash
cd /Users/sunny/projects/web-service

# 새 저장소를 원격으로 추가 (이름: docs-repo)
git remote add docs-repo https://github.com/newbase/docs.git
```

---

## 2. docs + screenshots만 담은 브랜치 만들기

문서는 `../screenshots` 경로를 쓰므로 **docs**와 **screenshots** 폴더를 함께 올려야 이미지가 보입니다.

```bash
cd /Users/sunny/projects/web-service

# 기존 히스토리 없이 새 브랜치 생성 (docs + screenshots만 포함)
git checkout --orphan docs-publish

# 스테이징 초기화 (아무것도 선택 안 된 상태)
git reset

# docs 폴더와 screenshots 폴더만 추가
git add docs/ screenshots/

# 커밋
git commit -m "docs: 백엔드 워크플로우 문서 및 스크린샷"
```

---

## 3. 새 저장소로 푸시 (main 브랜치로)

```bash
# docs-publish 브랜치를 newbase/docs의 main으로 푸시
git push docs-repo docs-publish:main
```

---

## 4. GitHub Pages 설정

1. **https://github.com/newbase/docs** 접속
2. **Settings** → 왼쪽 **Pages**
3. **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. **Save** 클릭
5. 1~2분 후 배포 완료

---

## 5. 공유할 URL

| 용도 | URL |
|------|-----|
| **진입 페이지** | https://newbase.github.io/docs/docs/backend-workflow-index.html |
| **Student** | https://newbase.github.io/docs/docs/backend-workflow-student.html |
| **Master** | https://newbase.github.io/docs/docs/backend-workflow-master.html |
| **Admin** | https://newbase.github.io/docs/docs/backend-workflow-admin.html |

> 첫 번째 `docs`는 GitHub Pages 사이트 주소, 두 번째 `docs`는 저장소 안의 폴더 이름입니다.

---

## 6. 이후 web-service로 돌아가기

```bash
# 기존 작업 브랜치로 복귀
git checkout ux-design

# docs-repo 원격은 그대로 두어도 됨 (필요 시 제거: git remote remove docs-repo)
```

---

## 7. 나중에 문서만 수정 후 다시 올리기

문서를 수정한 뒤 새 docs 저장소에 반영하려면:

```bash
cd /Users/sunny/projects/web-service

# docs-publish 브랜치로 이동
git checkout docs-publish

# main(또는 ux-design)에서 최신 docs, screenshots 가져오기 (선택)
# git checkout main -- docs/ screenshots/
# 또는 수정한 파일만 추가
git add docs/ screenshots/
git commit -m "docs: 내용 업데이트"
git push docs-repo docs-publish:main

# 다시 작업 브랜치로
git checkout ux-design
```

---

## 요약

| 단계 | 명령어 |
|------|--------|
| 원격 추가 | `git remote add docs-repo https://github.com/newbase/docs.git` |
| 전용 브랜치 생성 | `git checkout --orphan docs-publish` → `git reset` → `git add docs/ screenshots/` → `git commit` |
| 푸시 | `git push docs-repo docs-publish:main` |
| Pages | Settings → Pages → Branch: main, Folder: / (root) |
