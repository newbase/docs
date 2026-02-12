/**
 * 학생(Student) 권한 사용자 전체 페이지 스크린샷
 * - test1student / test1234 로그인 (테스트 계정: docs/test-accounts.md)
 * - 01 대시보드, 02 마이클래스, 03 오픈클래스, 03b OpenClassDetail(일반/1번), 03c OpenClassDetail(참여중/2번), 04 장바구니,
 *   05 수강신청확인, 06 주문내역, 07 설정, 08 JoinByCodeModal, 09 MyClassDetail, 10 ClassSession,
 *   11 SimulationResults
 *
 * 사용법: my-app 실행 후
 *   node scripts/screenshot-student-all-pages.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'screenshots', process.env.SCREENSHOT_OUTPUT || 'student-0212');
const WAIT_NAV = 2200;

const STUDENT_LOGIN = {
  loginId: process.env.LOGIN_ID || 'test1student',
  password: process.env.LOGIN_PW || 'test1234',
};

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 15000 });
  await page.locator('#loginId').fill(STUDENT_LOGIN.loginId);
  await page.locator('#password').fill(STUDENT_LOGIN.password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });
}

async function capture(page, filePath, fullPage = true) {
  await page.screenshot({ path: filePath, fullPage });
  console.log('  저장:', filePath);
}

const STUDENT_PAGES = [
  { path: '/student/dashboard', slug: '01-dashboard' },
  { path: '/student/my-classes', slug: '02-my-classes' },
  { path: '/open-class-list', slug: '03-open-class-list' },
  // 04-cart: open-class-list에서 첫 번째 클래스 장바구니 담은 후 별도 처리
  // 05-order-confirm: 장바구니에서 수강신청하기 클릭 후 별도 처리
  { path: '/student/orders', slug: '06-orders' },
];

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
    console.log(`=== 학생 로그인 (${STUDENT_LOGIN.loginId}) ===`);
    await login(page);
    console.log('로그인 완료\n');

    for (const { path, slug } of STUDENT_PAGES) {
      const url = `${BASE_URL}${path}`;
      console.log(`[${slug}] ${path}`);

      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(WAIT_NAV);

        const filePath = join(OUTPUT_DIR, `${slug}.png`);
        await capture(page, filePath);
        captured.push(`${slug}.png`);
      } catch (err) {
        console.error('  오류:', err.message);
      }
      console.log('');
    }

    // 03b: OpenClassDetail — 일반 클래스 (1번 아이템)
    console.log('[03b] OpenClassDetail (일반 클래스, 1번 아이템)');
    try {
      await page.goto(`${BASE_URL}/open-class-list`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const cards = page.locator('div.cursor-pointer.rounded-xl');
      const firstCard = cards.first();
      if (await firstCard.count() > 0 && (await firstCard.isVisible().catch(() => false))) {
        await firstCard.click();
        await page.waitForURL(/\/open-class\/\d+/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '03b-open-class-detail-normal.png'));
        captured.push('03b-open-class-detail-normal.png');
      } else {
        await page.goto(`${BASE_URL}/open-class/001`, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '03b-open-class-detail-normal.png'));
        captured.push('03b-open-class-detail-normal.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 03c: OpenClassDetail — 참여중 클래스 (2번 아이템)
    console.log('[03c] OpenClassDetail (참여중 클래스, 2번 아이템)');
    try {
      await page.goto(`${BASE_URL}/open-class-list`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const cards = page.locator('div.cursor-pointer.rounded-xl');
      if (await cards.count() >= 2) {
        await cards.nth(1).click();
        await page.waitForURL(/\/open-class\/\d+/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '03c-open-class-detail-participating.png'));
        captured.push('03c-open-class-detail-participating.png');
      } else {
        await page.goto(`${BASE_URL}/open-class/002`, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '03c-open-class-detail-participating.png'));
        captured.push('03c-open-class-detail-participating.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 04-cart: 오픈클래스 목록 → 첫 번째 클래스 카드 클릭 → 장바구니 담기 → 장바구니 페이지 캡처
    console.log('[04-cart] 오픈클래스 첫 번째 클래스 장바구니 담은 후');
    try {
      await page.goto(`${BASE_URL}/open-class-list`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const firstCard = page.locator('div.cursor-pointer.rounded-xl').first();
      if (await firstCard.count() > 0 && (await firstCard.isVisible().catch(() => false))) {
        await firstCard.click();
        await page.waitForURL(/\/open-class\/\d+/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        const cartBtn = page.getByRole('button', { name: '장바구니 담기' }).first();
        if (await cartBtn.isVisible().catch(() => false)) {
          await cartBtn.click();
          await page.waitForTimeout(800);
        }
      }
      await page.goto(`${BASE_URL}/student/cart`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '04-cart.png'));
      captured.push('04-cart.png');

      // 05-order-confirm: 장바구니에서 "수강신청하기" 클릭 후 order-confirm 페이지 캡처
      const enrollBtn = page.getByRole('button', { name: '수강신청하기' }).first();
      if (await enrollBtn.isVisible().catch(() => false)) {
        await enrollBtn.click();
        await page.waitForURL(/\/order-confirm/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '05-order-confirm.png'));
        captured.push('05-order-confirm.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 프로필 메뉴 > 설정 페이지 (프로필 드롭다운에서 "설정" 클릭 후 캡처)
    console.log('[07] 프로필 메뉴 > 설정');
    try {
      await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const profileTrigger = page.locator('button').filter({ has: page.locator('div.rounded-full') }).first();
      if (await profileTrigger.isVisible().catch(() => false)) {
        await profileTrigger.click();
        await page.waitForTimeout(500);
        const settingsBtn = page.getByRole('button', { name: '설정' }).first();
        if (await settingsBtn.isVisible().catch(() => false)) {
          await settingsBtn.click();
          await page.waitForURL(/\/settings/, { timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(WAIT_NAV);
          await capture(page, join(OUTPUT_DIR, '07-settings.png'));
          captured.push('07-settings.png');
        } else {
          await page.goto(`${BASE_URL}/settings`, { waitUntil: 'load', timeout: 30000 });
          await page.waitForTimeout(WAIT_NAV);
          await capture(page, join(OUTPUT_DIR, '07-settings.png'));
          captured.push('07-settings.png');
        }
      } else {
        await page.goto(`${BASE_URL}/settings`, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '07-settings.png'));
        captured.push('07-settings.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 08: 클래스 초대링크 등록 (JoinByCodeModal) — 마이클래스에서 "초대코드 등록" 클릭 후 모달 캡처
    console.log('[08] 클래스 초대링크 등록 (JoinByCodeModal)');
    try {
      await page.goto(`${BASE_URL}/student/my-classes`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const joinByCodeBtn = page.getByRole('button', { name: '초대코드 등록' }).first();
      if (await joinByCodeBtn.isVisible().catch(() => false)) {
        await joinByCodeBtn.click();
        await page.waitForTimeout(600);
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible().catch(() => false)) {
          await capture(page, join(OUTPUT_DIR, '08-join-by-code-modal.png'));
          captured.push('08-join-by-code-modal.png');
        } else {
          await capture(page, join(OUTPUT_DIR, '08-join-by-code-modal.png'));
          captured.push('08-join-by-code-modal.png');
        }
      } else {
        console.log('  (초대코드 등록 버튼 없음, 스킵)');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 09: 마이클래스에서 첫 번째 카드 클릭 → MyClassDetail
    console.log('[09] MyClassDetail (첫 번째 클래스 카드)');
    try {
      await page.goto(`${BASE_URL}/student/my-classes`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      const firstCard = page.locator('div.cursor-pointer.rounded-xl').first();
      if (await firstCard.count() > 0 && (await firstCard.isVisible().catch(() => false))) {
        await firstCard.click();
        await page.waitForURL(/\/student\/my-classes\/[^/]+$/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '09-my-class-detail.png'));
        captured.push('09-my-class-detail.png');
      } else {
        console.log('  (클래스 카드 없음, 스킵)');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 10: ClassSession (세션 참여 페이지)
    console.log('[10] ClassSession');
    try {
      await page.goto(`${BASE_URL}/class/001/curriculum/1`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '10-class-session.png'));
      captured.push('10-class-session.png');
    } catch (e) {
      console.error('  오류:', e.message);
    }
    console.log('');

    // 11: SimulationResults (시뮬레이션 결과 페이지)
    console.log('[11] SimulationResults');
    try {
      await page.goto(`${BASE_URL}/class/001/results/1`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(WAIT_NAV);
      await capture(page, join(OUTPUT_DIR, '11-simulation-results.png'));
      captured.push('11-simulation-results.png');
    } catch (e) {
      console.error('  오류:', e.message);
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
