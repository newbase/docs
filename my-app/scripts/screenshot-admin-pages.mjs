/**
 * Admin 사용자 페이지 스크린샷 생성 (최신 화면 반영)
 * - 앱이 실행 중이어야 함 (npm start → http://localhost:3000)
 * - Playwright 필요: npx playwright install chromium
 *
 * 사용: npm run screenshot:admin
 * 또는: BASE_URL=http://localhost:3001 npm run screenshot:admin
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), '..', 'screenshots', 'admin_20250223');

const MOCK_ADMIN_USER = {
  id: 'ADMIN001',
  name: '관리자',
  email: 'admin@example.com',
  profileImageUrl: null,
  isAuthenticated: true,
  currentAccount: {
    accountId: 'acc-admin-001',
    organizationId: '1',
    organizationName: '본사',
    role: 'admin',
    license: 'premium',
    licenseType: 'user',
  },
  accounts: [
    {
      accountId: 'acc-admin-001',
      organizationId: '1',
      organizationName: '본사',
      role: 'admin',
      license: 'premium',
      licenseType: 'user',
      isActive: true,
    },
  ],
};

const ADMIN_PAGES = [
  { path: '/admin/dashboard', name: '01-dashboard' },
  { path: '/admin/organizations', name: '02-기관고객관리' },
  { path: '/admin/organizations/1', name: '03-기관고객-상세' },
  { path: '/admin/class-management', name: '04-클래스관리' },
  { path: '/admin/open-class/create', name: '05-오픈클래스-생성' },
  { path: '/admin/open-class/001', name: '07-오픈클래스-상세' },
  { path: '/admin/open-class/edit/001', name: '08-오픈클래스-편집' },
  { path: '/admin/class/create', name: '06-기관클래스-생성' },
  { path: '/admin/my-classes/001', name: '09-기관클래스-상세' },
  { path: '/admin/class/edit/001', name: '10-기관클래스-편집' },
  { path: '/admin/product-management', name: '11-프로덕트관리' },
  { path: '/admin/product/create', name: '12-프로덕트-생성' },
  { path: '/admin/product/detail/001', name: '13-프로덕트-상세' },
  { path: '/admin/product/edit/001', name: '14-프로덕트-편집' },
  { path: '/admin/users', name: '15-사용자관리' },
  { path: '/admin/scenarios', name: '17-시나리오관리' },
  { path: '/admin/order-management', name: '19-주문관리' },
  { path: '/admin/order-management/create', name: '20-주문등록' },
  { path: '/admin/order-management/PO-202501-001', name: '20e-주문상세조회' },
  { path: '/admin/order-management/PO-202501-001/edit', name: '20g-주문수정' },
  { path: '/admin/assets/events', name: '21-에셋-이벤트관리' },
  { path: '/admin/assets/events/create', name: '22-에셋-이벤트생성' },
  { path: '/admin/assets/symptoms', name: '23-에셋-증상' },
  { path: '/admin/assets/tasks', name: '24-에셋-태스크' },
  { path: '/admin/assets/actions', name: '25-에셋-액션' },
  { path: '/admin/assets/dialogues', name: '26-에셋-대화' },
  { path: '/admin/assets/items', name: '27-에셋-아이템' },
  { path: '/settings', name: '29-설정' },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.evaluate((user) => {
      localStorage.setItem('medicrew_user', JSON.stringify(user));
    }, MOCK_ADMIN_USER);

    for (const { path, name } of ADMIN_PAGES) {
      const url = `${BASE_URL}${path}`;
      console.log(`캡처 중: ${path} → ${name}.png`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
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
