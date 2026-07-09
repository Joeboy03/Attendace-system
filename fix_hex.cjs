const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/hover:text-\[\#4bc2a0\]/g, 'hover:text-purple-800');
  content = content.replace(/focus:ring-offset-\[\#232427\]/g, 'focus:ring-offset-white');
  content = content.replace(/bg-\[\#18191B\]/g, 'bg-slate-50');
  content = content.replace(/bg-\[\#232427\]/g, 'bg-white');
  content = content.replace(/bg-\[\#2D2E32\]/g, 'bg-white');
  content = content.replace(/text-slate-300/g, 'text-slate-600');
  content = content.replace(/border-slate-800/g, 'border-slate-200');
  content = content.replace(/border-slate-700/g, 'border-slate-200');
  content = content.replace(/text-\[\#60D8B6\]/g, 'text-purple-600');
  content = content.replace(/bg-\[\#60D8B6\]/g, 'bg-purple-900');
  content = content.replace(/hover:bg-\[\#4bc2a0\]/g, 'hover:bg-purple-800');
  content = content.replace(/focus:border-\[\#60D8B6\]/g, 'focus:border-purple-500');
  content = content.replace(/focus:ring-\[\#60D8B6\]/g, 'focus:ring-purple-500');
  content = content.replace(/bg-\[\#60D8B6\]\/10/g, 'bg-purple-100');
  content = content.replace(/text-\[\#18191B\]/g, 'text-white');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});

