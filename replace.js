const fs = require('fs');
const path = require('path');

const dirs = [
  'front-end/app', 
  'front-end/components', 
  'backend/src', 
  'backend/prisma',
  'admin-dashboard/app', 
  'admin-dashboard/components', 
  'admin-dashboard/src'
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const replacements = [
    { regex: /alityan/g, replacement: 'alraay' },
    { regex: /Alityan/g, replacement: 'Al-Raay' },
    { regex: /Al-ityan/g, replacement: 'Al-Raay' },
    { regex: /الاتيان/g, replacement: 'الرأي' },
    { regex: /الإتيان/g, replacement: 'الرأي' },
    { regex: /اتيان/g, replacement: 'رأي' },
    { regex: /إتيان/g, replacement: 'رأي' }
  ];

  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }

  // Handle specific SVG replacements if any SVGs were imported as text, though handled via SVGs directly.
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath)) {
      replaceInFile(fullPath);
    }
  }
}

dirs.forEach(d => walk(path.join(__dirname, d)));
