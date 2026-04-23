import fs from 'fs';
import path from 'path';

const replacements = [
  { regex: /border-white\/\[0\.04\]/g, replacement: 'border-border-subtle' },
  { regex: /border-white\/10/g, replacement: 'border-border-subtle' },
  { regex: /border-white\/\[0\.06\]/g, replacement: 'border-border-subtle' },
  { regex: /border-white\/5/g, replacement: 'border-border-subtle' },
  { regex: /border-white\/20/g, replacement: 'border-border-strong' },
  { regex: /border-white\/30/g, replacement: 'border-border-strong' },
  { regex: /text-white\/([a-z0-9\.]+)/g, replacement: 'text-text-soft' },
  { regex: /text-white/g, replacement: 'text-text-main' },
  { regex: /bg-white\/[0-9\.]+|bg-white\/\[[0-9\.]+\]/g, replacement: 'bg-black/5 dark:bg-white/5' }
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
console.log('Done!');
