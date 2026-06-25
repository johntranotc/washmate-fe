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

function processDirectory(dir) {
  walk(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove mock arrays like `const mockBookings = [...]`
    content = content.replace(/const\s+mock[A-Za-z0-9_]+\s*=\s*\[[\s\S]*?\];/g, '');

    // Replace catch blocks containing 'Mock' or 'Demo' or 'loadCustomerBookingList'
    content = content.replace(/catch\s*\([^)]*\)\s*\{[\s\S]*?(?:Mock|Demo|loadCustomerBookingList|demoPayment)[\s\S]*?\}/g, 'catch (error) { console.error("API fallback removed", error); }');

    // Replace .catch(() => { ...Mock... })
    content = content.replace(/\.catch\s*\([^)]*\)\s*=>\s*\{[\s\S]*?(?:Mock|Demo)[\s\S]*?\}\)/g, '.catch((error) => { console.error("API fallback removed", error); })');

    // Replace if (isMock) { ... }
    content = content.replace(/if\s*\([^)]*Mock[^)]*\)\s*\{[\s\S]*?\}/g, '');
    content = content.replace(/if\s*\([^)]*Demo[^)]*\)\s*\{[\s\S]*?\}/g, '');

    // Replace ternary usingMockData ? A : B
    content = content.replace(/[a-zA-Z0-9_]*Mock[a-zA-Z0-9_]*\s*\?\s*([^:]+)\s*:\s*([^;,\n]+)/g, '$2');

    // Strip out remaining usages of DemoDataNotice
    content = content.replace(/<DemoDataNotice[^>]*\/>/g, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Deep cleaned:', filePath);
    }
  });
}

processDirectory('./src');
