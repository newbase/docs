/**
 * 어드민 로그인 후 CRUD + 페이지 내 액션 버튼 실행 후 스크린샷
 * - admin 계정 test1 / test1234 로그인 (docs/test-accounts.md)
 * - 기관고객: 등록(모달), 관리(목록), 상세, 정보수정(모달), 노트추가(모달)
 * - 클래스: 관리, 오픈클래스/기관클래스 생성·상세·편집
 *   + 상세에서 참가자 관리(모달 또는 참가자평가관리), 참가자 초대(모달), 클래스 복제(페이지)
 *   + 참가자 평가관리 페이지에서 사이드바 "관리" 클릭 → 참가자 목록 편집 모드
 * - 프로덕트: 관리, 생성, 상세, 편집
 *   + 프로덕트 생성 페이지: 편집 버튼(편집모드), 초기화 버튼(초기화 후)
 * - 시나리오/주문/사용자/에셋 등 동일 CRUD 흐름
 *
 * 사용법: my-app 실행 후
 *   node scripts/screenshot-admin-all-pages.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'screenshots', 'admin_20250213');
const WAIT_NAV = 2200;
const WAIT_MODAL = 900;

function slug(s) {
  return String(s).replace(/[^a-z0-9가-힣]+/gi, '-').replace(/^-|-$/g, '');
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('#loginId').fill('test1');
  await page.locator('#password').fill('test1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });
}

async function capture(page, filePath, fullPage = true) {
  await page.screenshot({ path: filePath, fullPage });
  console.log('  저장:', filePath);
}

async function closeModal(page) {
  const cancelBtn = page.getByRole('button', { name: /^취소$|^닫기$|취소하기|Close/i }).first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);
}

async function clickModalButton(page, btnText) {
  const btn = page.getByRole('button', { name: btnText }).or(page.locator(`button:has-text("${btnText}")`)).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(WAIT_MODAL);
    return true;
  }
  return false;
}

async function captureModal(page, slugName, modalLabel) {
  if (await page.locator('[role="dialog"]').count() === 0) return;
  const path = join(OUTPUT_DIR, `${slugName}-modal-${slug(modalLabel)}.png`);
  await capture(page, path);
  await closeModal(page);
  await page.waitForTimeout(500);
  await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
}

async function ensureModalClosed(page) {
  if (await page.locator('[role="dialog"]').isVisible().catch(() => false)) {
    await closeModal(page);
    await page.waitForTimeout(500);
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: process.platform === 'darwin' ? 'chrome' : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const captured = [];

  try {
    console.log('=== 로그인 ===');
    await login(page);
    console.log('로그인 완료\n');

    // ---------- 1. 대시보드 ----------
    console.log('[1] 대시보드');
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '01-dashboard.png'));
    captured.push('01-dashboard.png');

    // ---------- 2. 기관고객 CRUD: 등록(모달), 관리(목록), 상세, 정보수정(모달), 노트추가(모달) ----------
    console.log('\n[2] 기관고객 관리 (목록)');
    await page.goto(`${BASE_URL}/admin/organizations`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '02-기관고객관리.png'));
    captured.push('02-기관고객관리.png');

    console.log('  기관고객 등록 모달');
    if (await clickModalButton(page, '신규 등록')) {
      await captureModal(page, '02-기관고객등록', '기관등록');
      captured.push('02-기관고객등록-modal-기관등록.png');
    }

    // 기관 상세: 기관 ID 9 (가톨릭대학교 의과대학) - 라이선스 목록 스크린샷용
    const TARGET_ORG_ID = 9;
    console.log(`  기관 상세 (기관 ID ${TARGET_ORG_ID} - 가톨릭대학교 의과대학)`);
    await page.waitForTimeout(500);
    await page.goto(`${BASE_URL}/admin/organizations/${TARGET_ORG_ID}`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    if (page.url().includes(`/admin/organizations/${TARGET_ORG_ID}`)) {
      await capture(page, join(OUTPUT_DIR, '03-기관고객-상세.png'));
      captured.push('03-기관고객-상세.png');

      if (await clickModalButton(page, '수정')) {
        await captureModal(page, '03-기관고객', '정보수정');
        captured.push('03-기관고객-modal-정보수정.png');
      }
      await ensureModalClosed(page);
      const noteBtn = page.getByRole('button', { name: '노트 추가' }).first();
      if (await noteBtn.isVisible().catch(() => false)) {
        try {
          await noteBtn.click({ timeout: 8000 });
        } catch (e) {
          await ensureModalClosed(page);
          await noteBtn.click({ timeout: 6000 }).catch(() => {});
        }
        await page.waitForTimeout(WAIT_MODAL);
        if (await page.locator('[role="dialog"]').count() > 0) {
          await captureModal(page, '03-기관고객', '노트추가');
          captured.push('03-기관고객-modal-노트추가.png');
        }
      }
    }

    // ---------- 3. 클래스 관리 + 오픈클래스/기관클래스 CRUD ----------
    console.log('\n[3] 클래스 관리 (목록)');
    await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '04-클래스관리.png'));
    captured.push('04-클래스관리.png');

    console.log('  오픈클래스 생성 페이지');
    await page.getByRole('button', { name: '오픈클래스 생성' }).click();
    await page.waitForURL(/\/admin\/open-class\/create/, { timeout: 10000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '05-오픈클래스-생성.png'));
    captured.push('05-오픈클래스-생성.png');

    console.log('  기관클래스 생성 페이지');
    await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await page.getByRole('button', { name: '기관클래스 생성' }).click();
    await page.waitForURL(/\/admin\/class\/create/, { timeout: 10000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '06-기관클래스-생성.png'));
    captured.push('06-기관클래스-생성.png');

    console.log('  클래스 목록에서 오픈클래스 상세/편집, 기관클래스 상세/편집');
    await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    let openClassRowIdx = -1;
    let orgClassRowIdx = -1;
    for (let i = 0; i < rowCount; i++) {
      const badge = rows.nth(i).locator('td').nth(1).locator('text=오픈').first();
      const badgeOrg = rows.nth(i).locator('td').nth(1).locator('text=기관').first();
      if (await badge.isVisible().catch(() => false)) openClassRowIdx = openClassRowIdx < 0 ? i : openClassRowIdx;
      if (await badgeOrg.isVisible().catch(() => false)) orgClassRowIdx = orgClassRowIdx < 0 ? i : orgClassRowIdx;
    }

    if (openClassRowIdx >= 0) {
      const openRow = rows.nth(openClassRowIdx);
      const titleCell = openRow.locator('td').nth(2).locator('div.cursor-pointer').first();
      if (await titleCell.isVisible().catch(() => false)) {
        await titleCell.click();
        await page.waitForURL(/\/admin\/open-class\/[^/]+$/, { timeout: 10000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '07-오픈클래스-상세.png'));
        captured.push('07-오픈클래스-상세.png');

        const openDetailUrl = page.url();
        const openPmBtn = page.getByRole('button', { name: '참가자 관리' });
        if (await openPmBtn.isVisible().catch(() => false)) {
          await openPmBtn.click();
          await page.waitForTimeout(WAIT_MODAL + 300);
          if (page.url().includes('/results/')) {
            await page.waitForTimeout(WAIT_NAV);
            await capture(page, join(OUTPUT_DIR, '07a-오픈클래스-참가자평가관리.png'));
            captured.push('07a-오픈클래스-참가자평가관리.png');
            const openSidebarManage = page.locator('button').filter({ hasText: '관리' }).first();
            if (await openSidebarManage.isVisible().catch(() => false)) {
              await openSidebarManage.click();
              await page.waitForTimeout(600);
              await capture(page, join(OUTPUT_DIR, '07b-오픈클래스-참가자목록편집.png'));
              captured.push('07b-오픈클래스-참가자목록편집.png');
            }
            await page.goto(openDetailUrl, { waitUntil: 'load', timeout: 25000 });
            await page.waitForTimeout(WAIT_NAV);
          } else if (await page.locator('[role="dialog"]').count() > 0) {
            await capture(page, join(OUTPUT_DIR, '07a-오픈클래스-참가자관리-모달.png'));
            captured.push('07a-오픈클래스-참가자관리-모달.png');
            await closeModal(page);
          }
        }
        await page.goto(openDetailUrl, { waitUntil: 'load', timeout: 25000 });
        await page.waitForTimeout(WAIT_NAV);
        const openInviteBtn = page.getByRole('button', { name: '참가자 초대' });
        if (await openInviteBtn.isVisible().catch(() => false)) {
          await openInviteBtn.click();
          await page.waitForTimeout(WAIT_MODAL);
          if (await page.locator('[role="dialog"]').count() > 0) {
            await capture(page, join(OUTPUT_DIR, '07c-오픈클래스-참가자초대-모달.png'));
            captured.push('07c-오픈클래스-참가자초대-모달.png');
            await closeModal(page);
          }
        }
        await page.goto(openDetailUrl, { waitUntil: 'load', timeout: 25000 });
        await page.waitForTimeout(WAIT_NAV);
        const openCloneBtn = page.getByRole('button', { name: '클래스 복제' });
        if (await openCloneBtn.isVisible().catch(() => false)) {
          await openCloneBtn.click().catch(() => {});
          await page.waitForURL(/\/open-class\/create/, { timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(WAIT_NAV);
          if (page.url().includes('/open-class/create')) {
            await capture(page, join(OUTPUT_DIR, '07d-오픈클래스-복제-페이지.png'));
            captured.push('07d-오픈클래스-복제-페이지.png');
          }
        }
      }
      await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      const openRowAgain = page.locator('table tbody tr').nth(openClassRowIdx);
      const dropdownTrigger = openRowAgain.locator('button').last();
      if (await dropdownTrigger.isVisible().catch(() => false)) {
        await dropdownTrigger.click();
        await page.waitForTimeout(400);
        await page.getByRole('menuitem', { name: '수정' }).first().click();
        await page.waitForURL(/\/admin\/open-class\/edit\//, { timeout: 10000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '08-오픈클래스-편집.png'));
        captured.push('08-오픈클래스-편집.png');
      }
    }

    if (orgClassRowIdx >= 0) {
      await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      const orgRow = page.locator('table tbody tr').nth(orgClassRowIdx);
      const titleCell = orgRow.locator('td').nth(2).locator('div.cursor-pointer').first();
      if (await titleCell.isVisible().catch(() => false)) {
        await titleCell.click();
        await page.waitForURL(/\/admin\/class-management\/[^/]+$/, { timeout: 10000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '09-기관클래스-상세.png'));
        captured.push('09-기관클래스-상세.png');

        const classDetailUrl = page.url();
        const pmBtn = page.getByRole('button', { name: '참가자 관리' });
        if (await pmBtn.isVisible().catch(() => false)) {
          await pmBtn.click();
          await page.waitForTimeout(WAIT_MODAL + 300);
          if (page.url().includes('/results/')) {
            await page.waitForTimeout(WAIT_NAV);
            await capture(page, join(OUTPUT_DIR, '09a-참가자평가관리.png'));
            captured.push('09a-참가자평가관리.png');
            const sidebarManageBtn = page.locator('button').filter({ hasText: '관리' }).first();
            if (await sidebarManageBtn.isVisible().catch(() => false)) {
              await sidebarManageBtn.click();
              await page.waitForTimeout(600);
              await capture(page, join(OUTPUT_DIR, '09b-참가자평가관리-참가자목록편집.png'));
              captured.push('09b-참가자평가관리-참가자목록편집.png');
            }
            await page.goto(classDetailUrl, { waitUntil: 'load', timeout: 25000 });
            await page.waitForTimeout(WAIT_NAV);
          } else if (await page.locator('[role="dialog"]').count() > 0) {
            await capture(page, join(OUTPUT_DIR, '09a-클래스상세-참가자관리-모달.png'));
            captured.push('09a-클래스상세-참가자관리-모달.png');
            await closeModal(page);
          }
        }
        await page.goto(classDetailUrl, { waitUntil: 'load', timeout: 25000 });
        await page.waitForTimeout(WAIT_NAV);
        const inviteBtn = page.getByRole('button', { name: '참가자 초대' });
        if (await inviteBtn.isVisible().catch(() => false)) {
          await inviteBtn.click();
          await page.waitForTimeout(WAIT_MODAL);
          if (await page.locator('[role="dialog"]').count() > 0) {
            await capture(page, join(OUTPUT_DIR, '09c-클래스상세-참가자초대-모달.png'));
            captured.push('09c-클래스상세-참가자초대-모달.png');
            await closeModal(page);
          }
        }
        await page.goto(classDetailUrl, { waitUntil: 'load', timeout: 25000 });
        await page.waitForTimeout(WAIT_NAV);
        const cloneBtn = page.getByRole('button', { name: '클래스 복제' });
        if (await cloneBtn.isVisible().catch(() => false)) {
          await cloneBtn.click();
          await page.waitForURL(/\/class\/create|\/open-class\/create/, { timeout: 10000 });
          await page.waitForTimeout(WAIT_NAV);
          await capture(page, join(OUTPUT_DIR, '09d-클래스-복제-페이지.png'));
          captured.push('09d-클래스-복제-페이지.png');
        }
      }
      await page.goto(`${BASE_URL}/admin/class-management`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      const orgRowAgain = page.locator('table tbody tr').nth(orgClassRowIdx);
      const dropdownTrigger = orgRowAgain.locator('button').last();
      if (await dropdownTrigger.isVisible().catch(() => false)) {
        await dropdownTrigger.click();
        await page.waitForTimeout(400);
        await page.getByRole('menuitem', { name: '수정' }).first().click();
        await page.waitForURL(/\/admin\/class\/edit\//, { timeout: 10000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '10-기관클래스-편집.png'));
        captured.push('10-기관클래스-편집.png');
      }
    }

    // ---------- 4. 프로덕트 CRUD ----------
    console.log('\n[4] 프로덕트 관리');
    await page.goto(`${BASE_URL}/admin/product-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '11-프로덕트관리.png'));
    captured.push('11-프로덕트관리.png');

    const productCreateBtn = page.getByRole('button', { name: '프로덕트 생성' });
    if (await productCreateBtn.isVisible().catch(() => false)) {
      await productCreateBtn.click();
    } else {
      await page.goto(`${BASE_URL}/admin/product/create`, { waitUntil: 'load', timeout: 25000 });
    }
    if (page.url().includes('/product/create')) {
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '12-프로덕트-생성.png'));
      captured.push('12-프로덕트-생성.png');
      const editBtn = page.getByRole('button', { name: '편집' }).first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(WAIT_MODAL);
        await capture(page, join(OUTPUT_DIR, '12a-프로덕트-생성-편집모드.png'));
        captured.push('12a-프로덕트-생성-편집모드.png');
      }
      const resetBtn = page.getByRole('button', { name: '초기화' });
      if (await resetBtn.isVisible().catch(() => false)) {
        page.once('dialog', (d) => d.accept());
        await resetBtn.click();
        await page.waitForTimeout(500);
        await capture(page, join(OUTPUT_DIR, '12b-프로덕트-생성-초기화후.png'));
        captured.push('12b-프로덕트-생성-초기화후.png');
      }
    }

    await page.goto(`${BASE_URL}/admin/product-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    const firstProductRow = page.locator('table tbody tr').first();
    const productTitleCell = firstProductRow.locator('td').first().locator('div.cursor-pointer');
    if (await productTitleCell.count() > 0 && await productTitleCell.isVisible().catch(() => false)) {
      await productTitleCell.click();
      await page.waitForURL(/\/admin\/product\/detail\//, { timeout: 10000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '13-프로덕트-상세.png'));
      captured.push('13-프로덕트-상세.png');
    }
    await page.goto(`${BASE_URL}/admin/product-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    const firstProductRow2 = page.locator('table tbody tr').first();
    const productDropdown = firstProductRow2.locator('button').last();
    if (await productDropdown.isVisible().catch(() => false)) {
      await productDropdown.click();
      await page.waitForTimeout(400);
      await page.getByRole('menuitem', { name: '수정' }).first().click();
      await page.waitForURL(/\/admin\/product\/edit\//, { timeout: 10000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '14-프로덕트-편집.png'));
      captured.push('14-프로덕트-편집.png');
    }

    // ---------- 5. 사용자 관리 + 모달 ----------
    console.log('\n[5] 사용자 관리');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '15-사용자관리.png'));
    captured.push('15-사용자관리.png');

    if (await clickModalButton(page, '회원 일괄 등록')) {
      await captureModal(page, '15-사용자', '회원일괄등록');
      captured.push('15-사용자-modal-회원일괄등록.png');
    }

    const firstUserEditBtn = page.locator('table tbody tr').first().locator('button[title="수정"]');
    if (await firstUserEditBtn.isVisible().catch(() => false)) {
      await firstUserEditBtn.click();
      await page.waitForTimeout(WAIT_MODAL);
      if (await page.locator('[role="dialog"]').count() > 0) {
        await capture(page, join(OUTPUT_DIR, '16-사용자-정보수정-모달.png'));
        captured.push('16-사용자-정보수정-모달.png');
        await closeModal(page);
      }
    }

    // ---------- 6. 시나리오 관리 + 상세 ----------
    console.log('\n[6] 시나리오 관리');
    await page.goto(`${BASE_URL}/admin/scenarios`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '17-시나리오관리.png'));
    captured.push('17-시나리오관리.png');

    const firstScenarioLink = page.locator('table tbody tr').first().locator('div.font-semibold.text-blue-600');
    if (await firstScenarioLink.isVisible().catch(() => false)) {
      await firstScenarioLink.click();
      await page.waitForURL(/\/admin\/scenarios\/[^/]+$/, { timeout: 10000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '18-시나리오-상세.png'));
      captured.push('18-시나리오-상세.png');
    }

    // ---------- 7. 주문 관리 + 주문 등록 ----------
    console.log('\n[7] 주문 관리');
    await page.goto(`${BASE_URL}/admin/order-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '19-주문관리.png'));
    captured.push('19-주문관리.png');

    await page.getByRole('button', { name: '주문 등록' }).click();
    await page.waitForURL(/\/admin\/order-management\/create/, { timeout: 10000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '20-주문등록.png'));
    captured.push('20-주문등록.png');

    // 주문생성 - 주문유형별 선택 후 품목추가 (구독, 장비/물품, 오픈클래스, 커스텀 서비스)
    const orderTypeFlows = [
      { value: 'SUBSCRIPTION', slug: '20a-주문생성-구독-품목추가' },
      { value: 'PRODUCT_EQUIPMENT', slug: '20b-주문생성-장비물품-품목추가' },
      { value: 'OPEN_CLASS', slug: '20c-주문생성-오픈클래스-품목추가' },
      { value: 'CUSTOM_SERVICE', slug: '20d-주문생성-커스텀서비스-품목추가' },
    ];
    for (const { value, slug } of orderTypeFlows) {
      await page.goto(`${BASE_URL}/admin/order-management/create`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      const sel = page.locator('select').filter({ has: page.locator(`option[value="${value}"]`) }).first();
      if (await sel.isVisible().catch(() => false)) {
        await sel.selectOption(value);
        await page.waitForTimeout(600);
        const addItemBtn = page.getByRole('button', { name: '품목 추가' });
        if (await addItemBtn.isVisible().catch(() => false)) {
          await addItemBtn.click();
          await page.waitForTimeout(WAIT_MODAL);
        }
        await capture(page, join(OUTPUT_DIR, `${slug}.png`));
        captured.push(`${slug}.png`);
      }
    }

    // 주문상세조회: 주문관리 목록에서 주문번호 클릭
    console.log('  주문상세조회 (목록에서 주문번호 클릭)');
    await page.goto(`${BASE_URL}/admin/order-management`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    const firstOrderIdLink = page.locator('a[href*="/admin/order-management/"]').filter({ hasNot: page.locator('text=create') }).first();
    if (await firstOrderIdLink.isVisible().catch(() => false)) {
      await firstOrderIdLink.click();
      await page.waitForURL(/\/admin\/order-management\/ORD-/, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(WAIT_NAV);
      if (page.url().includes('/order-management/') && !page.url().endsWith('/create')) {
        await capture(page, join(OUTPUT_DIR, '20e-주문상세조회.png'));
        captured.push('20e-주문상세조회.png');
      }
    }

    // ---------- 8. 에셋: 이벤트/증상/태스크/액션/대화/아이템 ----------
    const assetPages = [
      { path: '/admin/assets/events', slug: '21-에셋-이벤트관리' },
      { path: '/admin/assets/events/create', slug: '22-에셋-이벤트생성' },
      { path: '/admin/assets/symptoms', slug: '23-에셋-증상' },
      { path: '/admin/assets/tasks', slug: '24-에셋-태스크' },
      { path: '/admin/assets/actions', slug: '25-에셋-액션' },
      { path: '/admin/assets/dialogues', slug: '26-에셋-대화' },
      { path: '/admin/assets/items', slug: '27-에셋-아이템' },
    ];
    for (const { path, slug: s } of assetPages) {
      console.log('\n[8]', s);
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, `${s}.png`));
      captured.push(`${s}.png`);
    }

    console.log('\n  이벤트 편집 페이지 (첫 번째 행 편집)');
    await page.goto(`${BASE_URL}/admin/assets/events`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    const firstEventEditBtn = page.locator('table tbody tr').first().locator('button[title="수정"]');
    if (await firstEventEditBtn.isVisible().catch(() => false)) {
      await firstEventEditBtn.click();
      await page.waitForURL(/\/admin\/assets\/events\/.+\/edit/, { timeout: 10000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '28-에셋-이벤트편집.png'));
      captured.push('28-에셋-이벤트편집.png');
    }

    // ---------- 9. 설정 ----------
    console.log('\n[9] 설정');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '29-설정.png'));
    captured.push('29-설정.png');

    // ---------- 10. 마이클래스 (master 로그인 후) ----------
    console.log('\n[10] 마이클래스 (master 로그인)');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(WAIT_NAV);
    await page.locator('#loginId').fill('test1master');
    await page.locator('#password').fill('test1234');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });
    await page.waitForTimeout(WAIT_NAV);

    console.log('  마이클래스 목록');
    await page.goto(`${BASE_URL}/master/my-classes`, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(WAIT_NAV);
    await capture(page, join(OUTPUT_DIR, '30-마이클래스-목록.png'));
    captured.push('30-마이클래스-목록.png');

    console.log('  마이클래스 초대코드 등록 모달');
    const joinCodeBtn = page.getByRole('button', { name: '초대코드 등록' });
    if (await joinCodeBtn.isVisible().catch(() => false)) {
      await joinCodeBtn.click();
      await page.waitForTimeout(WAIT_MODAL);
      if (await page.locator('[role="dialog"]').count() > 0) {
        await capture(page, join(OUTPUT_DIR, '31-마이클래스-초대코드등록-모달.png'));
        captured.push('31-마이클래스-초대코드등록-모달.png');
        await closeModal(page);
      }
    }

    console.log('  마이클래스 상세');
    const firstClassCard = page.locator('div[class*="rounded-xl"][class*="border"]').filter({ has: page.locator('h3') }).first();
    if (await firstClassCard.isVisible().catch(() => false)) {
      await firstClassCard.click();
      await page.waitForURL(/\/master\/my-classes\/[^/]+$/, { timeout: 8000 }).catch(() => {});
    } else {
      await page.goto(`${BASE_URL}/master/my-classes/001`, { waitUntil: 'load', timeout: 25000 });
    }
    await page.waitForTimeout(WAIT_NAV);
    if (page.url().includes('/my-classes/') && !page.url().endsWith('my-classes')) {
      await capture(page, join(OUTPUT_DIR, '32-마이클래스-상세.png'));
      captured.push('32-마이클래스-상세.png');

      const classId = page.url().match(/\/my-classes\/([^/]+)/)?.[1] || '001';

      console.log('  세션참여 (세션 참여 버튼 클릭)');
      const sessionStartBtn = page.getByRole('button', { name: '세션 시작' });
      const sessionJoinBtn = page.getByRole('button', { name: '세션 참여' });
      if (await sessionStartBtn.isVisible().catch(() => false)) {
        await sessionStartBtn.click();
        await page.waitForTimeout(600);
      }
      if (await sessionJoinBtn.isVisible().catch(() => false)) {
        await sessionJoinBtn.click();
        await page.waitForURL(/\/class\/.+\/curriculum\/.+/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        if (page.url().includes('/curriculum/')) {
          await capture(page, join(OUTPUT_DIR, '33-세션참여.png'));
          captured.push('33-세션참여.png');
        }
      }

      console.log('  결과보기 (커리큘럼 > 결과보기 버튼 클릭)');
      await page.goto(`${BASE_URL}/master/my-classes/${classId}`, { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(WAIT_NAV);
      const resultsBtn = page.getByRole('button', { name: '결과보기' }).first();
      if (await resultsBtn.isVisible().catch(() => false)) {
        await resultsBtn.click();
        await page.waitForURL(/\/class\/.+\/results\/.+/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        if (page.url().includes('/results/')) {
          await capture(page, join(OUTPUT_DIR, '34-결과보기.png'));
          captured.push('34-결과보기.png');
        }
      }
    }

    console.log('\n=== 완료 ===');
    console.log('캡처된 파일 수:', captured.length);
    captured.forEach((f) => console.log('  -', f));
  } catch (err) {
    console.error('오류:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
