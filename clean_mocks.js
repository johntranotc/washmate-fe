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

  // Remove import { ...mock... } from ...
  content = content.replace(/^import\s+.*mock.*?\n/gm, '');

  // Remove import DemoDataNotice from ...
  content = content.replace(/^import\s+DemoDataNotice.*?\n/gm, '');

  // Remove <DemoDataNotice />
  content = content.replace(/<DemoDataNotice\s*\/>/g, '');
  content = content.replace(/\{isMock\s*&&\s*<DemoDataNotice\s*\/>\}/g, '');

  // Replace mockData with []
  content = content.replace(/\bmockData\b/g, '[]');

  // Replace loyaltyMockAccount with {}
  content = content.replace(/\bloyaltyMockAccount\b/g, '{}');
  
  // Replace customerDashboardMockData with {}
  content = content.replace(/\bcustomerDashboardMockData\b/g, '{}');

  // Replace AdminMockData with []
  content = content.replace(/\badminMockData\b/g, '[]');

  // Remove setIsMock(...)
  content = content.replace(/setIsMock\([^)]*\);?/g, '');

  // Remove const [isMock, setIsMock] = useState(...);
  content = content.replace(/const\s*\[isMock,\s*setIsMock\]\s*=\s*useState\([^)]*\);?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned:', filePath);
  }
});
