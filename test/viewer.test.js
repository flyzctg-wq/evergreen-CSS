const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Viewer.html contains accessibility features for language toggle button', () => {
  const htmlPath = path.join(process.cwd(), 'Viewer.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Check that button element has aria-label and title
  assert.ok(
    htmlContent.includes('id="lang-toggle-btn" aria-label="Switch language to Bengali" title="Switch language to Bengali"'),
    'Language toggle button should have aria-label and title attributes'
  );

  // Check for focus-visible CSS rule
  assert.ok(
    htmlContent.includes('#lang-toggle-btn:focus-visible'),
    'Language toggle button should have focus-visible CSS rule'
  );

  // Check that translatePage updates aria-label and title dynamically
  assert.ok(
    htmlContent.includes('$toggle.setAttribute("aria-label", nextLangLabel)'),
    'translatePage should dynamically set aria-label'
  );
  assert.ok(
    htmlContent.includes('$toggle.setAttribute("title", nextLangLabel)'),
    'translatePage should dynamically set title'
  );
});
