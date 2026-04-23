import fs from 'fs';
import path from 'path';

const replacements = [
  { regex: /zinc-800/g, replacement: 'border-subtle' }, // border-zinc-800 -> border-border-subtle
  { regex: /text-zinc-100/g, replacement: 'text-text-main' },
  { regex: /text-zinc-500/g, replacement: 'text-text-main\/40' },
  { regex: /bg-zinc-900/g, replacement: 'bg-panel-2' },
  { regex: /bg-zinc-600/g, replacement: 'bg-text-main\/20' }
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
console.log('Done mapping zinc colors!');
