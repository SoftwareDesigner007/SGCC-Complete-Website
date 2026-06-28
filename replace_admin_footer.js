const fs = require('fs');
const path = require('path');

const filesToUpdate = ['admin.html', 'admin-course.html'];

const newFooter = `<div class="mt-12 pt-6 border-t border-secondary/20 text-center flex flex-col items-center gap-3">
<p class="font-headline text-sm md:text-base text-on-surface-variant tracking-wide font-medium bg-gradient-to-r from-on-surface-variant to-on-surface bg-clip-text text-transparent">© 2026-2027 Shree Ganesh Computer Classes. All rights reserved.</p>
<p class="font-headline text-sm md:text-base text-on-surface flex items-center gap-2 font-medium tracking-wide">
<span class="opacity-80">Created with</span> 
<span class="material-symbols-outlined text-primary text-lg animate-pulse drop-shadow-[0_0_8px_rgba(255,26,107,0.6)]" style='font-variation-settings:"FILL" 1'>favorite</span> 
<span class="opacity-80">by</span> 
<span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary font-bold text-lg hover:scale-105 transition-transform cursor-default drop-shadow-sm">Lakshman Goswami</span>
</p>
</div>`;

for (const file of filesToUpdate) {
  const fullPath = path.join('.', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const regex = /<div class="mt-12 pt-6 border-t border-slate-800\/30 text-center(?:[^>]*?)>[\s\S]*?Lakshman Goswami<\/span><\/p>\s*<\/div>/g;
    
    if (regex.test(content)) {
      content = content.replace(regex, newFooter);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated', file);
    }
  }
}
console.log('Done');
