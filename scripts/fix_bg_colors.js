import fs from 'fs';
import path from 'path';

const replacements = [
  { regex: /bg-\[#0d0d0d\]/g, replacement: 'bg-panel-2' },
  { regex: /bg-\[#0a0c0d\]\/90/g, replacement: 'bg-panel-2/90' },
  { regex: /bg-\[#0e1112\]/g, replacement: 'bg-panel' },
  { regex: /bg-\[#0d1011\]/g, replacement: 'bg-panel-2' },
  { regex: /bg-\[#111\]/g, replacement: 'bg-panel' },
  { regex: /bg-\[#030303\]/g, replacement: 'bg-root-bg' },
  { regex: /bg-\[#000\]/g, replacement: 'bg-root-bg' },
  { regex: /bg-black px-2/g, replacement: 'bg-panel-2 px-2' },
  { regex: /bg-black p-/g, replacement: 'bg-panel-2 p-' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = content;
      
      for (const { regex, replacement } of replacements) {
        modified = modified.replace(regex, replacement);
      }
      
      if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), '../src'));
console.log('Done mapping bg colors!');
