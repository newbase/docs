import React from 'react';

const DOC_BASE = 'https://newbase.github.io/docs/docs';

const indexLinks = [
  { href: `${DOC_BASE}/backend-workflow-index.html`, label: '백엔드 워크플로우 (진입)' },
  { href: `${DOC_BASE}/backend-workflow-student.html`, label: 'Student' },
  { href: `${DOC_BASE}/backend-workflow-master.html`, label: 'Master' },
  { href: `${DOC_BASE}/backend-workflow-admin.html`, label: 'Admin' },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Medicrew Doc</h1>
        <ul className="space-y-2">
          {indexLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
