import fs from 'fs';
import path from 'path';

const replacements = [
  { regex: /text-\[#8ee7df\]/g, replacement: 'text-primary-main' },
  { regex: /text-\[#9ff7ee\]/g, replacement: 'text-primary-main' },
  { regex: /bg-\[#12b3a8\]/g, replacement: 'bg-primary-main' }, // just in case
  { regex: /text-\[#12b3a8\]/g, replacement: 'text-primary-main' },
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
console.log('Done mapping text colors!');
