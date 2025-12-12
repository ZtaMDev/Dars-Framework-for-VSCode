const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function main() {
  const root = __dirname;
  const outDir = path.join(root, 'out');
  ensureDir(outDir);

  copyFile(path.join(root, 'src', 'extension.js'), path.join(outDir, 'extension.js'));

  console.log('[build] Copied src/extension.js -> out/extension.js');
}

main();
