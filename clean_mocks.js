const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
      callback(dirPath);
    }
  });
}

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove DemoDataNotice imports
  content = content.replace(/^import\s+DemoDataNotice.*?;\r?\n/gm, '');

  // 2. Remove all mock file imports (from mocks/ or -mock-data)
  content = content.replace(/^import\s+.*?from\s+["'].*?(mocks\/|-mock-data|-demo-store).*?["'];?\r?\n/gm, '');
  
  // Also specific destructuring imports from those files if they spanned multiple lines
  content = content.replace(/^import\s*\{[^}]*\}\s*from\s*["'].*?(mocks\/|-mock-data|-demo-store).*?["'];?\r?\n/gm, '');

  // 3. Remove <DemoDataNotice />
  content = content.replace(/<DemoDataNotice\s*\/>/g, '');
  content = content.replace(/\{isMock\s*&&\s*\}/g, '');
  content = content.replace(/\{isMock\s*&&\s*<DemoDataNotice\s*\/>\}/g, '');

  // 4. Remove useState and setIsMock
  content = content.replace(/const\s*\[isMock,\s*setIsMock\]\s*=\s*useState\([^)]*\);?\r?\n/g, '');
  content = content.replace(/setIsMock\([^)]*\);?/g, '');

  // 5. Replace references to missing variables from deleted files (if any). Let's see what breaks later.
  // We can just rely on the build step to tell us.

  // Wait, there are some `isMock` usages in booking flows:
  // e.g. `if (selection.garage.isMock)`
  // `isMock: true`
  // Let's remove `isMock: true`
  content = content.replace(/isMock:\s*true,?\s*/g, '');
  content = content.replace(/isMock\s*&&\s*/g, '');
  content = content.replace(/booking\.isMock\s*&&\s*<span[^>]*>.*?<\/span>/g, '');
  content = content.replace(/invoice\.isMock\s*&&\s*<span[^>]*>.*?<\/span>/g, '');
  content = content.replace(/invoice\.isMock\s*&&\s*<p[^>]*>.*?<\/p>/g, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned:', filePath);
  }
});
