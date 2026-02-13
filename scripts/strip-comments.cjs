const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) processFile(full);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1) Remove JSX comments: {/* ... */}
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // 2) Remove HTML comments <!-- ... -->
  content = content.replace(/<!--([\s\S]*?)-->/g, '');

  // 3) Remove block comments /* ... */
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // 4) Remove line comments //... but avoid URLs (http://, https://)
  // Remove // comments only when not preceded by ':' (simple heuristic)
  content = content.replace(/(^|[^:\n\r])\/\/.*$/gm, (m, p1) => p1);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Stripped comments:', path.relative(ROOT, filePath));
  }
}

console.log('Starting comment strip...');
walk(ROOT);
console.log('Done.');
