const fs = require('fs');
const path = require('path');
const dir = '.';

const newFooter = `<div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-secondary/20 text-center flex flex-col items-center gap-3">
<p class="font-headline text-sm md:text-base text-on-surface-variant tracking-wide font-medium bg-gradient-to-r from-on-surface-variant to-on-surface bg-clip-text text-transparent">© 2026-2027 Shree Ganesh Computer Classes. All rights reserved.</p>
<p class="font-headline text-sm md:text-base text-on-surface flex items-center gap-2 font-medium tracking-wide">
<span class="opacity-80">Created with</span> 
<span class="material-symbols-outlined text-primary text-lg animate-pulse drop-shadow-[0_0_8px_rgba(255,26,107,0.6)]" style='font-variation-settings:"FILL" 1'>favorite</span> 
<span class="opacity-80">by</span> 
<span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary font-bold text-lg hover:scale-105 transition-transform cursor-default drop-shadow-sm">Lakshman Goswami</span>
</p>
</div>`;

function replaceInDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if(file !== 'node_modules' && file !== '.git' && file !== '.idea' && file !== '.vscode' && file !== 'dist') {
          replaceInDir(fullPath);
      }
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /<div class="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center(?:[^>]*?)>[\s\S]*?Lakshman Goswami<\/span><\/p>\s*<\/div>/g;
      
      if(regex.test(content)) {
          content = content.replace(regex, newFooter);
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(dir);
console.log('Done');
