/**
 * Student 사용자 페이지 스크린샷 생성
 * - 앱이 실행 중이어야 함 (npm start → http://localhost:3000)
 * - Playwright 필요: npx playwright install chromium
 *
 * 사용: node scripts/screenshot-student-pages.mjs
 * 또는: BASE_URL=http://localhost:3001 node scripts/screenshot-student-pages.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'screenshots', 'student');

// 앱에서 사용하는 student 사용자 형태 (localStorage medicrew_user)
const MOCK_STUDENT_USER = {
  id: 'ST001',
  name: '스크린샷 테스트',
  email: 'student@example.com',
  profileImageUrl: null,
  isAuthenticated: true,
  currentAccount: {
    accountId: 'acc-student-001',
    organizationId: null,
    organizationName: '',
    role: 'student',
    license: 'free',
    licenseType: 'user',
  },
  accounts: [
    {
      accountId: 'acc-student-001',
      organizationId: null,
      organizationName: '',
      role: 'student',
      license: 'free',
      licenseType: 'user',
      isActive: true,
    },
  ],
};

const STUDENT_PAGES = [
  { path: '/student/dashboard', name: '01-dashboard' },
  { path: '/open-class-list', name: '02-open-class-list' },
  { path: '/student/my-classes', name: '03-my-classes' },
  { path: '/student/my-classes/001', name: '04-my-class-detail' },
  { path: '/student/cart', name: '05-cart' },
  { path: '/student/orders', name: '06-orders' },
  { path: '/open-class/001', name: '07-open-class-detail' },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  try {
    // 로그인 상태 시뮬레이션: 먼저 앱 진입 후 localStorage에 student 사용자 설정
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate((user) => {
      localStorage.setItem('medicrew_user', JSON.stringify(user));
    }, MOCK_STUDENT_USER);

    for (const { path, name } of STUDENT_PAGES) {
      const url = `${BASE_URL}${path}`;
      console.log(`캡처 중: ${path} → ${name}.png`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const filePath = join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
    }

    console.log(`\n완료. 스크린샷 저장 위치: ${OUT_DIR}`);
  } catch (err) {
    console.error('스크린샷 생성 실패:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
