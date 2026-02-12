#!/usr/bin/env node
/**
 * Figma 기획서용 스펙 기반 리포트 생성
 *
 * docs/planning-spec.json을 읽어 다음을 생성:
 * - docs/planning-report.html: 역할별 스크린샷·기능·데이터·워크플로우 정리 (Figma 수동 반영 또는 참고용)
 * - docs/figma-structure.json: Figma에서 참고할 프레임 구조 (플러그인/수동용)
 *
 * Figma REST API는 새 파일 생성/노드 생성을 지원하지 않으므로, 생성된 HTML/JSON을 참고해
 * figma.com/new 에서 새 파일을 만든 뒤 수동으로 반영하거나, Figma Plugin으로 import 하세요.
 *
 * 사용법:
 *   node scripts/create-figma-planning.mjs
 *
 * 선택: 기존 Figma 파일에 요약 코멘트 추가 (FIGMA_TOKEN, FIGMA_FILE_KEY 환경변수 설정 시)
 *   FIGMA_TOKEN=xxx FIGMA_FILE_KEY=yyy node scripts/create-figma-planning.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SPEC_PATH = join(ROOT, 'docs', 'planning-spec.json');
const REPORT_HTML_PATH = join(ROOT, 'docs', 'planning-report.html');
const STRUCTURE_JSON_PATH = join(ROOT, 'docs', 'figma-structure.json');

function loadSpec() {
  const raw = readFileSync(SPEC_PATH, 'utf8');
  return JSON.parse(raw);
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(spec) {
  const title = escapeHtml(spec.title || '기획서');
  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    h1 { margin-top: 0; }
    .role { background: #fff; border-radius: 8px; padding: 24px; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .role h2 { margin-top: 0; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    .section { margin-top: 24px; }
    .section h3 { color: #374151; font-size: 1rem; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .screenshots figure { margin: 0; }
    .screenshots img { max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 4px; }
    .screenshots figcaption { font-size: 0.875rem; color: #6b7280; margin-top: 4px; }
    table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f9fafb; }
    .workflow { list-style: none; padding: 0; }
    .workflow li { padding: 4px 0; }
    .workflow strong { display: inline-block; min-width: 120px; }
    .missing { color: #9ca3af; font-style: italic; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>아래 내용을 Figma에 수동 반영하거나, <a href="https://figma.com/new">figma.com/new</a>에서 새 파일을 만든 뒤 스크린샷을 드래그하여 배치하세요.</p>
  <p>스크린샷별 <strong>액션, 필터, 검색, 테이블 데이터, 통계 산출식</strong> 상세 정의는 <a href="planning-spec-detail.md">planning-spec-detail.md</a>를 참고하세요.</p>
`;

  for (const role of spec.roles) {
    const name = escapeHtml(role.name);
    html += `  <div class="role">
    <h2>${role.order}. ${name}</h2>
    <div class="section">
      <h3>스크린샷</h3>
      <div class="screenshots">
`;
    for (const s of role.screenshots || []) {
      const rel = s.path.startsWith('screenshots/') ? '../' + s.path : s.path;
      const exists = existsSync(join(ROOT, s.path));
      const src = exists ? rel : '';
      const alt = escapeHtml(s.name);
      const caption = escapeHtml(s.name);
      if (src) {
        html += `        <figure><img src="${escapeHtml(rel)}" alt="${alt}" loading="lazy" /><figcaption>${caption}</figcaption></figure>
`;
      } else {
        html += `        <figure><figcaption class="missing">${caption} (파일 없음: ${escapeHtml(s.path)})</figcaption></figure>
`;
      }
    }
    html += `      </div>
    </div>
    <div class="section">
      <h3>기능 정의</h3>
      <table>
        <thead><tr><th>기능명</th><th>경로</th><th>컴포넌트</th><th>설명</th></tr></thead>
        <tbody>
`;
    for (const f of role.features || []) {
      html += `          <tr><td>${escapeHtml(f.name)}</td><td><code>${escapeHtml(f.path || '')}</code></td><td>${escapeHtml(f.component || '')}</td><td>${escapeHtml(f.description || '')}</td></tr>
`;
    }
    html += `        </tbody>
      </table>
    </div>
    <div class="section">
      <h3>데이터 정의</h3>
      <table>
        <thead><tr><th>엔티티</th><th>필드</th><th>출처</th></tr></thead>
        <tbody>
`;
    for (const d of role.data || []) {
      const fields = Array.isArray(d.fields) ? d.fields.join(', ') : '';
      html += `          <tr><td>${escapeHtml(d.entity)}</td><td>${escapeHtml(fields)}</td><td>${escapeHtml(d.source || '')}</td></tr>
`;
    }
    html += `        </tbody>
      </table>
    </div>
    <div class="section">
      <h3>사용자 워크플로우</h3>
      <ul class="workflow">
`;
    for (const w of role.workflows || []) {
      const steps = Array.isArray(w.steps) ? w.steps.join(' → ') : '';
      html += `        <li><strong>${escapeHtml(w.name)}</strong> ${escapeHtml(steps)}</li>
`;
    }
    html += `      </ul>
    </div>
  </div>
`;
  }

  html += `</body>
</html>
`;
  return html;
}

function buildFigmaStructure(spec) {
  const structure = {
    description: 'Figma에서 1. Student, 2. Master, 3. Admin 프레임을 만들고, 각 프레임 안에 스크린샷·기능·데이터·워크플로우 섹션을 배치할 때 참고하세요.',
    frames: spec.roles.map((role) => ({
      name: `${role.order}. ${role.name}`,
      sections: [
        { name: '스크린샷', type: 'images', items: (role.screenshots || []).map((s) => ({ path: s.path, name: s.name })) },
        { name: '기능 정의', type: 'text', items: role.features || [] },
        { name: '데이터 정의', type: 'text', items: role.data || [] },
        { name: '사용자 워크플로우', type: 'text', items: role.workflows || [] },
      ],
    })),
  };
  return JSON.stringify(structure, null, 2);
}

async function maybePostFigmaComment(spec) {
  const token = process.env.FIGMA_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!token || !fileKey) return;

  const summary = spec.roles
    .map((r) => `${r.name}: 스크린샷 ${(r.screenshots || []).length}개, 기능 ${(r.features || []).length}개`)
    .join('\n');
  const message = `[기획서 스펙 요약]\n${summary}\n\n상세: 프로젝트 docs/planning-report.html 참고`;

  try {
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': token },
    });
    if (!fileRes.ok) {
      console.warn('Figma 파일 조회 실패:', fileRes.status);
      return;
    }
    const fileData = await fileRes.json();
    const document = fileData.document;
    const nodeId = document?.id;
    if (!nodeId) {
      console.warn('Figma 파일에서 루트 노드를 찾을 수 없습니다.');
      return;
    }

    const commentRes = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        client_meta: { x: 0, y: 0 },
      }),
    });
    if (commentRes.ok) {
      console.log('Figma 파일에 기획서 요약 코멘트를 추가했습니다.');
    } else {
      console.warn('Figma 코멘트 추가 실패:', commentRes.status, await commentRes.text());
    }
  } catch (err) {
    console.warn('Figma API 오류:', err.message);
  }
}

function main() {
  console.log('planning-spec.json 읽는 중...');
  const spec = loadSpec();

  console.log('planning-report.html 생성 중...');
  const html = buildHtml(spec);
  writeFileSync(REPORT_HTML_PATH, html, 'utf8');
  console.log('  저장:', REPORT_HTML_PATH);

  console.log('figma-structure.json 생성 중...');
  const structureJson = buildFigmaStructure(spec);
  writeFileSync(STRUCTURE_JSON_PATH, structureJson, 'utf8');
  console.log('  저장:', STRUCTURE_JSON_PATH);

  maybePostFigmaComment(spec).then(() => {
    console.log('\n완료. Figma에 반영하려면 figma.com/new 에서 새 파일을 만든 뒤 docs/planning-report.html 내용을 참고하세요.');
  });
}

main();
