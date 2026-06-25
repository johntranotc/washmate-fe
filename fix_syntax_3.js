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

  // 1. Remove import from mocks/loyaltyMockData
  content = content.replace(/^.*mocks\/loyaltyMockData.*$/gm, '');

  // 2. Remove import from lib/staff-demo-store
  content = content.replace(/^.*lib\/staff-demo-store.*$/gm, '');

  // 3. Fix .catch(() => );
  content = content.replace(/\.catch\(\(\)\s*=>\s*\)/g, '.catch(() => {})');

  // 4. Remove getStaffDemoBookings()
  content = content.replace(/getStaffDemoBookings\(\)/g, '[]');
  
  // 5. Replace loyaltyTierMockData and loyaltyTransactionMockData
  content = content.replace(/\bloyaltyTierMockData\b/g, '[]');
  content = content.replace(/\bloyaltyTransactionMockData\b/g, '[]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
});
