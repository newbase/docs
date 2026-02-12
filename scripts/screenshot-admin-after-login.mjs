/**
 * 로그인 후 어드민 사용자 화면 스크린샷
 * - 로그인 페이지에서 test / 1234 (어드민 계정)으로 로그인
 * - /admin/dashboard 로 이동 후 전체 페이지 스크린샷 저장
 *
 * 사용법:
 * 1. my-app 개발 서버 실행: cd my-app && npm start
 * 2. 다른 터미널에서: npx playwright install chromium && node scripts/screenshot-admin-after-login.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'screenshots');
const OUTPUT_FILE = join(OUTPUT_DIR, 'admin-dashboard-after-login.png');

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: process.platform === 'darwin' ? 'chrome' : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1. 로그인 페이지 이동:', `${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    console.log('2. 어드민 계정 입력 (test / 1234)');
    await page.locator('#loginId').fill('test');
    await page.locator('#password').fill('1234');

    console.log('3. 로그인 버튼 클릭');
    await page.getByRole('button', { name: '로그인' }).click();

    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    console.log('4. 로그인 완료, 어드민 대시보드로 이동');

    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: OUTPUT_FILE, fullPage: true });
    console.log('5. 스크린샷 저장:', OUTPUT_FILE);
  } catch (err) {
    console.error('오류:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
