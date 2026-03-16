const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\ASUS\\Documents\\mobile idea\\client\\src';

function replaceInFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We do a regex replace to catch exact class names
      // Specifically avoiding replacing text-white inside bg-white text-white combinations if any exist, 
      // but text-white -> text-ag-text will just adapt to the theme text color.
      // We also replace text-white/50 to text-ag-text/50
      let newContent = content.replace(/\btext-white\b(\/[0-9]+)?/g, (match, opacity) => {
          return opacity ? `text-ag-text${opacity}` : 'text-ag-text';
      });

      // Let's also replace border-white/10 and border-white/5 to border-ag-border
      newContent = newContent.replace(/\bborder-white\/[0-9]+\b/g, 'border-ag-border');
      
      // Let's also replace bg-white/5 and bg-white/10 to bg-ag-bg-card or bg-ag-bg-input depending on context,
      // but to be safe, we might just replace it with bg-ag-bg-card
      newContent = newContent.replace(/\bbg-white\/[0-9]+(\.[0-9]+)?\b/g, 'bg-ag-bg-card');
      
      // bg-black/40 or bg-black/60 to bg-black/10 dark:bg-black/60 (maybe too complex, leave bg-black alone for now, it's usually modals)
      
      // Just basic white text is the biggest issue for light mode readability against a light background
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

replaceInFiles(srcDir);
console.log('Done replacing hardcoded white styles.');
