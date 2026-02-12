/**
 * 마스터 권한 사용자 전체 페이지 스크린샷
 * - sunny-master / sunny123 로그인
 * - 마스터는 에셋 관리 접근 불가 → 대시보드, 마이클래스, 클래스관리, 프로덕트, 오픈클래스, 시나리오, 기관만 캡처
 *
 * 사용법: my-app 실행 후
 *   node scripts/screenshot-master-all-pages.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'screenshots', 'master-all');
const WAIT_NAV = 2200;
const WAIT_MODAL = 800;

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#loginId').fill('sunny-master');
  await page.locator('#password').fill('sunny123');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });
}

async function capture(page, filePath, fullPage = true) {
  await page.screenshot({ path: filePath, fullPage });
  console.log('  저장:', filePath);
}

// 마스터 전용 페이지 (에셋 관리 제외 - 마스터는 에셋 접근 불가)
const MASTER_PAGES = [
  { path: '/master/dashboard', slug: '01-dashboard' },
  { path: '/master/my-classes', slug: '02-my-classes' },
  { path: '/master/class-management', slug: '03-class-management' },
  { path: '/master/product-management', slug: '04-product-management' },
  { path: '/master/product/create', slug: '05-product-create' },
  { path: '/master/open-class/create', slug: '06-open-class-create' },
  { path: '/master/class/create', slug: '07-class-create' },
  { path: '/master/scenarios', slug: '08-scenarios' },
  { path: '/master/organization', slug: '09-organization' },
  { path: '/settings', slug: '10-settings' },
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
    console.log('=== 마스터 로그인 (sunny-master / sunny123) ===');
    await login(page);
    console.log('로그인 완료\n');

    for (const { path, slug } of MASTER_PAGES) {
      const url = `${BASE_URL}${path}`;
      console.log(`[${slug}] ${path}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(WAIT_NAV);

        const filePath = join(OUTPUT_DIR, `${slug}.png`);
        await capture(page, filePath);
        captured.push(`${slug}.png`);
      } catch (err) {
        console.error('  오류:', err.message);
      }
      console.log('');
    }

    // 클래스 관리 목록에서 첫 번째 행 클릭 → 클래스 상세
    console.log('[11] 클래스 상세 (첫 번째 클래스)');
    try {
      await page.goto(`${BASE_URL}/master/class-management`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(WAIT_NAV);
      const firstRow = page.locator('table tbody tr').first();
      const titleCell = firstRow.locator('td').nth(2).locator('div.cursor-pointer').first();
      if (await titleCell.count() > 0 && await titleCell.isVisible().catch(() => false)) {
        await titleCell.click();
        await page.waitForURL(/\/master\/class-management\/[^/]+$/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '11-class-detail.png'));
        captured.push('11-class-detail.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }

    // 시나리오 목록에서 첫 번째 행 클릭 → 시나리오 상세
    console.log('\n[12] 시나리오 상세 (첫 번째 시나리오)');
    try {
      await page.goto(`${BASE_URL}/master/scenarios`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(WAIT_NAV);
      const firstScenario = page.locator('table tbody tr').first().locator('div.font-semibold.text-blue-600');
      if (await firstScenario.isVisible().catch(() => false)) {
        await firstScenario.click();
        await page.waitForURL(/\/master\/scenarios\/[^/]+$/, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '12-scenario-detail.png'));
        captured.push('12-scenario-detail.png');
      }
    } catch (e) {
      console.error('  오류:', e.message);
    }

    // 프로덕트 목록에서 첫 번째 행 클릭 → 상세 (앱이 /admin으로 이동할 수 있음)
    console.log('\n[13] 프로덕트 상세 (첫 번째 프로덕트)');
    try {
      await page.goto(`${BASE_URL}/master/product-management`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(WAIT_NAV);
      const firstProduct = page.locator('table tbody tr').first().locator('td').first().locator('div.cursor-pointer');
      if (await firstProduct.isVisible().catch(() => false)) {
        await firstProduct.click();
        await page.waitForTimeout(WAIT_NAV);
        await capture(page, join(OUTPUT_DIR, '13-product-detail.png'));
        captured.push('13-product-detail.png');
      }
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
