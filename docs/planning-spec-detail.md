# 기획서 상세 정의 (스크린샷별)

스크린샷 이미지별 **액션**, **필터**, **검색**, **테이블 표시 데이터**, **통계 산출식**을 정리한 문서입니다.

---

## 1. Student

### 1.1 대시보드 (01-dashboard.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **기간 필터 적용**: DateRangeFilter로 startDate~endDate 변경 시 목록/통계 재계산<br>• **필터 버튼**: 전체 / 진행중 / 완료 등 activeFilter 변경<br>• **검색**: listSearch로 목록 텍스트 검색<br>• **뷰 전환**: ViewModeToggle — 타임라인 / 리스트<br>• **클래스 카드 클릭**: 해당 클래스 상세로 이동<br>• **환자 카드**: (목업) Care Score, Duration 표시 |
| **필터** | • **기간**: startDate, endDate (기본: 3개월 전 ~ 오늘)<br>• **활동 필터**: all / 진행중 / 완료 등 (recentClasses, fullHistoryData 기준) |
| **검색** | • **검색창**: listSearch — recentClasses, patientsList, fullHistoryData의 제목/이름/내용 텍스트 검색 |
| **테이블/목록** | • **타임라인**: recentClasses — createdDate, classId, title, progress, status, lastAccess<br>• **리스트**: patientsList — name, age, gender, diagnosis, chiefComplaint, careScore, careDuration, status, dateEncountered, scenarioTitle<br>• **전체 이력**: fullHistoryData — id, title, createdDate, duration, score |
| **통계 산출식** | • **시뮬레이션 수**: `COUNT(fullHistoryData WHERE 기간 내 AND score > 0)`<br>• **시뮬레이션 시간**: `SUM(duration, fullHistoryData WHERE 기간 내 AND score > 0)` (HH:MM 파싱 후 분 합산 → 시간+분 표기)<br>• **클래스 이수**: `COUNT(DISTINCT classId, recentClasses WHERE 기간 내 AND (progress >= 100 OR status === 'completed'))`<br>• **참여 시나리오 수**: `COUNT(DISTINCT id, fullHistoryData WHERE 기간 내 AND score > 0)`<br>• **Perfect 획득**: `COUNT(DISTINCT id, fullHistoryData WHERE 기간 내 AND score === 100)` |

---

### 1.2 마이클래스 목록 (02-my-classes.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **초대코드 등록**: 버튼 클릭 → JoinByCodeModal 오픈<br>• **상태 필터**: 전체 / 참여가능 / 참여중 / 이수완료 / 종료 — statusFilter 변경, currentPage 1로 리셋<br>• **카드 클릭**: `navigate(basePath + '/my-classes/' + item.id)` → 마이클래스 상세 |
| **필터** | • **상태**: all \| eligible \| participating \| completed \| ended (getDisplayStatus: 수강기간 만료 시 ended) |
| **검색** | • 없음 (필터만) |
| **테이블/목록** | • **카드 목록**: currentClasses (페이지당 ITEMS_PER_PAGE=6) — item.id, item.title, item.thumbnail, item.participationPeriod, displayStatus(참여가능/참여중/이수완료/종료), curriculum 길이 등 |
| **통계** | • **참여중인 클래스**: activeClasses = myClassesList 중 상태=participating 이고 수강기간 내인 클래스 수 (상단 요약용) |

**데이터 정의**  
- myClassesList = allClasses 중 myClassStatusMap에 있거나 participatingClasses에 있는 클래스  
- getItemDisplayStatus(item) = getDisplayStatus(myClassStatusMap[item.id], item.participationPeriod?.endDate)  
- DISPLAY_STATUS_LABELS: eligible→참여가능, participating→참여중, completed→이수완료, ended→종료  

---

### 1.3 오픈클래스 목록 (03-open-class-list.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **클래스 카드/제목 클릭**: 오픈클래스 상세로 이동<br>• **수강신청하기 / 장바구니 담기**: 상세 또는 목록에서 클릭 시 해당 플로우 |
| **필터** | • (구현에 따라 검색/정렬 있을 수 있음) |
| **검색** | • (페이지 구현 참고) |
| **테이블/목록** | • 오픈클래스 카드: title, thumbnail, 기관명, 가격, 수강기간, 시나리오 수 등 |
| **통계** | • (해당 화면에 통계 카드 있으면 동일 방식으로 정리) |

---

### 1.4 장바구니 (04-cart.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **선택 체크박스**: selectedItems 토글<br>• **수량 변경**: quantity +/-<br>• **삭제**: 장바구니에서 항목 제거 (localStorage 'cart' 업데이트)<br>• **견적 문의**: quoteModal 오픈, quoteForm 제출<br>• **주문하기**: 선택 항목으로 주문 확인 페이지 이동 |
| **필터** | • 없음 |
| **검색** | • 없음 |
| **테이블/목록** | • CartItemEntry: id, quantity — 클래스 정보는 useClasses(organizationId)에서 id로 매칭해 title, price 등 표시 |
| **통계** | • 선택 합계 금액: 선택된 항목의 (단가 × 수량) 합계 |

**데이터 정의**  
- CartItemEntry: { id: string, quantity: number }  
- parseCart(localStorage 'cart') → CartItemEntry[]  
- QuoteRequestRecord: organizationName, name, department, phone, email, message, selectedClassIds, selectedItems, createdAt  

---

### 1.5 주문확인 (05-order-confirm.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **결제/주문 완료**: 주문 API 제출 후 성공 시 장바구니 비우기, 마이클래스 등으로 이동<br>• **취소/뒤로**: 장바구니로 복귀 |
| **필터/검색** | • 없음 |
| **테이블/목록** | • 주문 요약: 주문자, 수강 클래스 목록, 수량, 단가, 합계, 결제 수단 등 |
| **통계** | • 총 결제 금액 = Σ(단가 × 수량) |

---

### 1.6 주문내역 (06-orders.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **주문 행 클릭**: 주문 상세 또는 상태별 필터<br>• **페이지네이션**: currentPage 변경 |
| **필터** | • (구현 시) 상태/기간 필터 |
| **검색** | • (구현 시) 주문번호/주문자명 검색 |
| **테이블/목록** | • 주문 목록: id, ordererName, amount, status, createdAt, 주문 항목 요약 등 |
| **통계** | • (목록 상단 요약 있으면) 총 건수, 금액 합계 등 |

---

### 1.7 초대코드 등록 모달 (08-join-by-code-modal.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **6자리 코드 입력**: input 6개 (한 칸에 1자), 대문자/숫자만, 다음 칸 자동 포커스<br>• **붙여넣기**: 6자리 일괄 입력<br>• **등록**: classInviteService 등 API 호출 후 성공 시 마이클래스 상세로 이동<br>• **닫기**: 모달 닫기 |
| **필터/검색** | • 없음 |
| **테이블/목록** | • 없음 |
| **통계** | • 없음 |

**데이터 정의**  
- code: string[6] (각 칸 1자)  
- API: 초대코드 검증 및 클래스 참여 등록  

---

### 1.8 마이클래스 상세 (09-my-class-detail.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **세션 시작**: handleStartParticipation → setMyClassStatus(classId, 'participating')<br>• **세션 참여**: navigate(`/class/${classId}/curriculum/${list[0].id}`)<br>• **결과보기**: curriculum 항목별 결과보기 버튼 → navigate(`/class/${classId}/results/${item.id}`)<br>• **이수증 다운로드**: isCompleted 시 handleDownloadCertificate |
| **필터/검색** | • 없음 |
| **테이블/목록** | • **커리큘럼 목록**: item.name, item.duration, item.type(scenario/video) — 시나리오면 결과보기 버튼<br>• **참여 정보**: 수강기간, 이수목표, 이수율(completionRate) |
| **통계** | • **이수율**: completionRate (0~100) — Mock: 랜덤; 실제: API 또는 진행률 기반<br>• **이수완료**: completionRate >= 100 → 이수증 다운로드 가능 |

---

### 1.9 세션 참여 / 결과보기 (10-class-session.png, 11-simulation-results.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **세션**: 시뮬레이션 실행, 이전/다음 등 네비게이션<br>• **결과보기**: 점수, 피드백, 재도전 등 |
| **필터/검색** | • 없음 |
| **테이블/목록** | • 결과 화면: 점수, 소요시간, 정답/오답 요약 등 (구현에 따름) |
| **통계** | • Care Score, Duration 등 (시뮬레이션 결과 데이터) |

---

## 2. Master

### 2.1 클래스 관리 (03-class-management.png) — Admin ClassManagement와 유사

| 구분 | 내용 |
|------|------|
| **액션** | • **오픈클래스 생성**: ROUTES.ADMIN.OPEN_CLASS_CREATE 이동<br>• **기관클래스 생성**: ROUTES.ADMIN.CLASS_CREATE 이동<br>• **행 제목 클릭**: 오픈 → open-class/:id, 기관 → class-management/:id<br>• **수정**: 드롭다운 → open-class/edit/:id 또는 class/edit/:id<br>• **삭제**: 확인 후 목록에서 제거 |
| **필터** | • **검색**: searchTerm — title, description 포함 검색<br>• **클래스 유형**: all \| open \| organization (isForSale/price > 0 → open)<br>• **활성**: all \| active \| inactive (item.isActive !== false → active)<br>• **기간**: startDate, endDate — item.createdDate 기준 |
| **검색** | • SearchBar: searchTerm — ClassItem.title, ClassItem.description (대소문자 무시) |
| **테이블** | • **컬럼**: 유형(오픈/기관), 클래스명, 기관명, 시나리오 수, 참가자(current/max), 이수율(%), 소요시간, 생성자, 생성일, 수강기간, 상태(활성/비활성), 관리(수정/삭제)<br>• **데이터**: ClassItem — id, type, title, organizationName, curriculum.length, currentParticipants, maxParticipants, completionRate, getDurationDetails(totalTime), creatorId, createdDate, participationPeriod, isActive |
| **통계** | • (목록 상단 카드 있으면) 클래스 수, 오픈/기관 수 등 |

---

### 2.2 프로덕트 관리 (04-product-management.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **프로덕트 생성**: /admin/product/create 또는 /master/product/create<br>• **프로덕트명 클릭**: 상세 페이지<br>• **수정/삭제**: 드롭다운 메뉴 |
| **필터** | • **검색**: searchTerm — title, description<br>• **활성여부**: all \| active \| inactive |
| **검색** | • SearchBar: title, description 포함 검색 |
| **테이블** | • **컬럼**: 프로덕트명, 기관주문건수(orderCount), 기관주문금액(orgOrderAmount), 온라인 주문건수(openClassCount), 온라인 결제금액(cumulativePayment), 판매합계(totalSales), 등록일(createdDate), 활성여부, 관리<br>• **정렬**: orderCount, orgOrderAmount, openClassCount, cumulativePayment, totalSales, createdDate (asc/desc 토글) |
| **통계** | • **기관주문건수**: orderCount ?? currentParticipants<br>• **온라인 결제금액**: cumulativePayment ?? (unitPrice × currentParticipants), unitPrice = discountPrice ?? price ?? 0<br>• **판매합계**: totalSales ?? cumulativePayment |

---

### 2.3 마이클래스 목록/상세, 세션참여, 결과보기 (30~34)

Student와 동일 구조. basePath만 /master. 액션·필터·테이블·통계 정의는 1.2, 1.8, 1.9 참고.

---

## 3. Admin

### 3.1 대시보드 (01-dashboard.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **기간 필터**: startDate, endDate (기본 6개월 전 ~ 오늘)<br>• **필터/검색/뷰**: activeFilter, listSearch, viewMode (timeline/list)<br>• **인기 시나리오 기간**: popularScenarioPeriod — 1month / 3months / 6months / 1year<br>• **인기 시나리오 정렬**: popularScenarioSortBy — views / simulationCount<br>• **카드/링크 클릭**: 시나리오 상세, 기관 상세 등 해당 경로로 이동 |
| **필터** | • **기간**: DateRangeFilter<br>• **활동 필터**: all / 진행중 / 완료 등 |
| **검색** | • listSearch — 활동/시나리오 목록 텍스트 검색 |
| **테이블/목록** | • recentActivities (adminActivities 기반), 인기 시나리오 차트, 기관/주문 요약 등 (구현 참고) |
| **통계** | • 인기 시나리오: 기간·정렬 기준에 따른 views 또는 simulationCount 집계 |

---

### 3.2 기관고객 관리 (02-기관고객관리.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **신규 등록**: AddOrganizationModal 오픈<br>• **행 클릭**: 기관 상세 `/admin/organizations/:id`<br>• **수정**: EditOrganizationModal<br>• **삭제**: deleteOrganizationMutation, refetch |
| **필터** | • **통계 카드 클릭**: activeStatFilter — all / active / new / expiring (토글)<br>• **날짜 범위**: (필터 UI 있으면) startDate, endDate<br>• **검색**: (SearchBar 있으면) 기관명/국가 등 |
| **검색** | • 기관명, 국가 등 (ListHeader SearchBar) |
| **테이블** | • **컬럼**: 기관명(name), 국가(country), 유형(type), 상태(status), 라이선스 유형(licenseType), 라이선스 수(licenseCount), 디바이스 수(deviceCount), 사용자 수(userCount), 등록일(registeredDate), 만료일(expiryDate), 관리(수정/삭제)<br>• **데이터**: Organization (id, name, country, type, status, licenseType, licenseCount, deviceCount, userCount, registeredDate, expiryDate) |
| **통계 산출식** | • **전체 기관고객수**: totalOrganizations = realCountData?.totalCount \|\| MOCK_ORGANIZATIONS.length<br>• **활성 기관고객수**: activeOrganizations = realCountData?.activeCount \|\| MOCK 중 status === 'active' 개수<br>• **신규 기관고객수**: newOrganizations = 등록일(registeredDate)이 오늘 기준 30일 이내인 기관 수<br>• **만료 예정 라이센스**: expiringSoon = 만료일(expiryDate)이 오늘 ~ 30일 이내인 기관 수 (또는 realCountData?.expiringSoonCount) |

---

### 3.3 기관고객 상세 (03-기관고객-상세.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **수정**: 기관 정보 수정 모달<br>• **노트 추가**: 노트 추가 모달<br>• **라이선스 행 클릭**: `/admin/organizations/:orgId/licenses/:licenseId` |
| **필터/검색** | • (탭/필터 있으면 명시) |
| **테이블/목록** | • 기관 기본 정보, 라이선스 목록(라이선스명, 유형, 수량, 기간, 상태 등), 노트 목록 |
| **통계** | • (해당 화면 통계 카드 있으면) 라이선스 수, 사용자 수 등 |

---

### 3.4 클래스 관리 (04-클래스관리.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **오픈클래스 생성** / **기관클래스 생성**: 위 2.1과 동일<br>• **행 제목 클릭**: 오픈 → /admin/open-class/:id, 기관 → /admin/class-management/:id<br>• **수정/삭제**: 드롭다운 |
| **필터** | • **검색**: searchTerm — title, description<br>• **클래스 유형**: all / open / organization<br>• **활성**: all / active / inactive<br>• **기간**: startDate, endDate (createdDate) |
| **검색** | • SearchBar: title, description |
| **테이블** | • **컬럼**: 유형, 클래스명, 기관명, 시나리오 수, 참가자(current/max), 이수율(%), 소요시간, 생성자, 생성일, 수강기간, 상태, 관리 |
| **통계** | • (상단 카드 있으면) 전체/오픈/기관 클래스 수 |

---

### 3.5 주문 관리 (19-주문관리.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **주문 등록**: navigate(`${basePath}/order-management/create`)<br>• **주문번호 클릭**: 주문 상세 `/admin/order-management/:orderId`<br>• **주문상태 변경**: SimpleSelect onChange → updateOrderStatus(orderId, status)<br>• **통계 카드 클릭**: activeTab = 해당 유형(전체/구독/장비·물품/커스텀 서비스/오픈클래스), currentPage 1 |
| **필터** | • **탭(유형)**: activeTab — all \| 구독 \| 장비/물품 \| 커스텀 서비스 \| 오픈클래스<br>• **주문상태**: statusFilter (데모/견적, 주문진행, 주문완료 등)<br>• **판매처**: salesChannelFilter<br>• **기간**: DateRangeFilter — startDate, endDate |
| **검색** | • **검색창**: searchTerm — ordererName 부분 일치 (대소문자 무시) |
| **테이블** | • **컬럼**: 주문번호(id), 주문자명(ordererName), 주문유형(type, activeTab=all일 때만), 주문금액(amount), (예상)매출이익(expectedProfit), 판매처(salesChannel), 주문상태(status, SimpleSelect), 수정일시(updatedAt)<br>• **데이터**: OrderRow — id, ordererName, type, currency, amount, cost, expectedProfit, actualProfit, salesChannel, status, createdAt, updatedAt |
| **통계 산출식** | • **총 주문금액**: totalAmount = Σ(orders.amount)<br>• **총 수익율**: totalRate = (Σ expectedProfit / totalAmount) × 100 (%)<br>• **유형별 주문금액**: byType[type].amount = Σ(orders WHERE type === type).amount<br>• **유형별 수익율**: byType[type].rate = (Σ expectedProfit / byType[type].amount) × 100 (%) |

---

### 3.6 주문 등록 / 주문생성 (20-주문등록.png, 20a~20d)

| 구분 | 내용 |
|------|------|
| **액션** | • **주문유형 선택**: productType — DEFAULT \| SUBSCRIPTION \| PRODUCT_EQUIPMENT \| CUSTOM_SERVICE \| OPEN_CLASS<br>• **품목 추가**: setOrderItemRows에 새 행 추가 (productId, optionId, period, periodUnit, quantity, unitPrice, costPrice)<br>• **프로덕트 추가**: navigate(product/create)<br>• **통화**: currency KRW/USD<br>• **제출**: 유효성 검사 후 주문 API 호출 |
| **필터/검색** | • **주문자(기관) 검색**: orgSearchQuery — organizationService.getList({ search }) 로 suggestions 표시, 선택 시 selectedOrgId/selectedOrgName 설정<br>• **판매처**: agencySuggestions, selectedAgencyId |
| **테이블/목록** | • **품목 행**: productId(프로덕트 선택), optionId(구독플랜/옵션), period/periodUnit(기간), quantity, unitPrice, costPrice(장비·물품), 금액(quantity×unitPrice 등)<br>• **데이터**: OrderItemRow — id, productId, optionId, period, periodUnit, quantity, unitPrice, costPrice |
| **통계** | • **품목 합계**: Σ(quantity × unitPrice), VAT 등 (vatIncluded, vatRate 적용) |

---

### 3.7 주문 상세조회 (20e-주문상세조회.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **목록으로**: navigate(order-management)<br>• **수정**: order-management/:orderId/edit (구현 시)<br>• **주문상태 변경**: (구현 시) |
| **필터/검색** | • 없음 |
| **테이블** | • **기본 정보**: 주문번호, 주문자명, 주문유형, 판매처, 통화, 주문금액, 비용, 예상/실제 이익, 상태, 비고, 생성/수정일시<br>• **품목 테이블**: 주문유형별 — 구독(프로덕트명, 구독플랜, 구독기간, 수량, 단가, 금액), 장비·물품(프로덕트명, 옵션, 수량, 단가, 원가, 금액), 커스텀·오픈클래스(프로덕트명, 기간, 수량, 단가, 금액) — OrderDetailItem: productName, optionName, period, periodUnit, quantity, unitPrice, costPrice, amount, startDate |
| **통계** | • 주문금액 = Σ(items.amount), 예상이익 등 |

---

### 3.8 프로덕트 관리 (11-프로덕트관리.png)

위 2.2와 동일. basePath /admin. 테이블 컬럼·정렬·통계 동일.

---

### 3.9 사용자 관리 (15-사용자관리.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **회원 일괄 등록**: BulkCreate 모달, 엑셀 업로드 (fileInputRef)<br>• **엑셀 템플릿 다운로드**: downloadTemplateMutation<br>• **엑셀 내보내기**: exportExcelMutation (현재 필터/검색 조건 적용)<br>• **수정**: EditUserModal — updateUserInfoMutation, updateUserPasswordMutation<br>• **통계 카드 클릭**: activeStatFilter — all / total / organization / individual / active / withdrawal / newUsers / masters / students / guests |
| **필터** | • **검색**: searchQuery — 로그인ID/이름/이메일/기관명 등 (API search 파라미터)<br>• **고객유형**: customerTypeFilter — 기관고객 / 개인고객<br>• **계정유형**: accountTypeFilter — 정회원 / 게스트<br>• **역할**: roleFilter — Student / Master / Admin<br>• **상태**: statusFilter — 활성 / 비활성 / 탈퇴<br>• **날짜**: dateFilterType (registeredDate \| lastLogin), startDate, endDate |
| **검색** | • SearchBar: searchQuery → API search, 클라이언트에서는 status/role/customerType/accountType 키워드 제외 후 전달 |
| **테이블** | • **컬럼**: 로그인ID(loginId), 이름(name), 이메일(email), 고객유형(customerType), 기관명(organizationName), 역할(role), 계정유형(accountType), 등록일(registeredDate), 최근 로그인(lastLogin), 상태(status), 수강 클래스 수(classCount), 시뮬레이션 수(simulationCount), 관리(수정 등)<br>• **데이터**: User (UserInfoDto 변환) — userId, name, email, type, organizationName, role, createdAt, lastSigninAt, status, loginId, activeClassCount 등 |
| **통계 산출식** | • **전체**: total = useAllUserCount 또는 필터 결과 totalCount<br>• **기관/개인**: organization = 기관고객 수, individual = 개인고객 수<br>• **활성/탈퇴**: active, withdrawal (status 기준)<br>• **신규**: newUsers = 등록일이 30일 이내<br>• **역할별**: masters, students, guests (role 기준) — API 또는 클라이언트 집계 |

---

### 3.10 시나리오 관리 (17-시나리오관리.png)

| 구분 | 내용 |
|------|------|
| **액션** | • **시나리오 제목/링크 클릭**: 시나리오 상세<br>• **생성/수정**: (구현 시) |
| **필터** | • (검색/유형/상태 필터 있으면 명시) |
| **검색** | • (SearchBar 있으면) 시나리오명/코드 검색 |
| **테이블** | • **컬럼**: 시나리오명, 코드, 플랫폼, 상태, 수정일 등 (Scenario 타입) |
| **통계** | • (상단 카드 있으면) |

---

### 3.11 에셋 (21~27)

| 구분 | 내용 |
|------|------|
| **액션** | • **이벤트/증상/태스크/액션/대화/아이템** 각 목록: 생성, 수정, 삭제, 행 클릭 시 상세/편집<br>• **정렬/필터**: (각 페이지 구현 참고) |
| **필터** | • (페이지별 FilterGroup, FilterSelect 등) |
| **검색** | • (ListHeader SearchBar) |
| **테이블** | • 각 에셋 타입별 컬럼 (이벤트명, 증상명, 태스크명 등, 생성일, 수정일, 관리) |
| **통계** | • (해당 화면에 있으면) |

---

### 3.12 설정 (29-설정.png)

| 구분 | 내용 |
|------|------|
| **액션** | • 프로필 수정, 비밀번호 변경, 알림 설정 등 (Settings 컴포넌트 구현 참고) |
| **필터/검색** | • 없음 |
| **테이블** | • 설정 폼 필드들 |
| **통계** | • 없음 |

---

## 4. 데이터 엔티티 요약

| 엔티티 | 주요 필드 | 출처 |
|--------|-----------|------|
| ClassItem | id, type, title, subtitle, description, curriculum, participationPeriod, completionRequirements, maxParticipants, currentParticipants, completionRate, creatorId, createdDate, password, isForSale, saleStatus, organizationId, organizationName, price, discountPrice | data/classes, data/mock/classes |
| CurriculumItem | id, code, name, duration, platform, type, includes, author, url | data/classes |
| OrderRow | id, ordererName, type, currency, amount, cost, expectedProfit, actualProfit, salesChannel, status, createdAt, updatedAt | pages/order/OrderManagement |
| OrderDetailItem | id, productName, optionName, period, periodUnit, quantity, unitPrice, costPrice, amount, startDate | pages/order/OrderDetail |
| Organization | id, name, country, type, status, licenseType, licenseCount, deviceCount, userCount, registeredDate, expiryDate | types/admin, OrganizationList |
| User (UserInfoDto) | userId, name, email, loginId, type, role, organizationName, status, createdAt, lastSigninAt, activeClassCount | types/api/user, useUserManagement |
| CartItemEntry | id, quantity | pages/order/Cart |
| Patient (대시보드) | name, age, gender, diagnosis, chiefComplaint, careScore, careDuration, status, dateEncountered, scenarioTitle | types/dashboard |
| DashboardActivity | id, title, category, type, createdDate, status, classId, progress, lastAccess, duration, score | types/dashboard, data/mock/dashboard |

---

*이 문서는 코드베이스(라우트, 페이지 컴포넌트, Mock/타입)를 기준으로 작성되었습니다. 실제 API 연동 시 필드명·산출식은 백엔드 스펙에 맞게 조정하세요.*
