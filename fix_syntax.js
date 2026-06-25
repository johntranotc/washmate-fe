const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix import { {} } from "../../mocks/{}";
  // Fix import { [] } from "../../mocks/[]";
  content = content.replace(/^import\s*\{\s*(\[\]|\{\})\s*\}\s*from\s*["'].*?["'];?\n/gm, '');
  content = content.replace(/^import\s*\{\s*([^}]*?)(?:,\s*(\[\]|\{\})\s*|(\[\]|\{\})\s*,\s*)\}\s*from\s*["'].*?["'];?\n/gm, (match, other) => {
     return `import { ${other.trim()} } from "some_path";\n`; // This is tricky, let's just wipe out lines with import.*mock
  });
  
  // Actually, better to just wipe out any import line that contains 'mocks/' or '-mock-data'
  content = content.replace(/^import\s+.*?from\s+["'].*?(mocks\/|-mock-data).*?["'];?\n/gm, '');

  // Wait, there is a syntax error in LoyaltyPage.jsx:
  // 11 |   {},
  // Let's find any isolated `{},` that is a syntax error in import? No, it's probably an array like `[ {}, ]` 
  // Let me just replace the whole file content that might have broken.
  // Actually, wait, `loyaltyTransactionMockData` was replaced with `[]`, so `[ [] ]` or `[],` or `{},`.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
});
