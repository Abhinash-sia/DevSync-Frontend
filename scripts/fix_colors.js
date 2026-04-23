import fs from 'fs';
import path from 'path';

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      // Replace hardcoded tailwind arbitrary colors with CSS variables
      content = content.replace(/#12b3a8/g, 'var(--primary-2)');
      content = content.replace(/#0a7c80/g, 'var(--primary)');
      // Revert any accidentally messed up colors from earlier if they exist
      // Since we replaced some #9ff7ee with #12b3a8 in my earlier sed command, the regex catches them!
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceColors(path.join(process.cwd(), '../src'));
