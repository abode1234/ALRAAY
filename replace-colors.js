const fs = require('fs');
const path = require('path');

const dirs = [
  'front-end/app', 
  'front-end/components', 
  'admin-dashboard/app', 
  'admin-dashboard/components', 
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const replacements = [
    { regex: /#9c1fe5/gi, replacement: '#06c6a1' },
    { regex: /purple-/g, replacement: 'teal-' },
    { regex: /violet-/g, replacement: 'emerald-' },
  ];

  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated colors in:', filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(ts|tsx|js|jsx|css)$/.test(fullPath)) {
      replaceInFile(fullPath);
    }
  }
}

dirs.forEach(d => walk(path.join(__dirname, d)));
