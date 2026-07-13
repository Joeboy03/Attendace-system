const fs = require('fs');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/App.tsx'
];

const replacements = [
  { regex: /\bbg-slate-50(?![\/\w\-])/g, replace: 'bg-slate-50 dark:bg-[#0B090F]' },
  { regex: /\bbg-white(?![\/\w\-])/g, replace: 'bg-white dark:bg-[#15111D]' },
  { regex: /\btext-slate-900(?![\/\w\-])/g, replace: 'text-slate-900 dark:text-purple-50' },
  { regex: /\btext-slate-800(?![\/\w\-])/g, replace: 'text-slate-800 dark:text-purple-100' },
  { regex: /\btext-slate-700(?![\/\w\-])/g, replace: 'text-slate-700 dark:text-purple-200' },
  { regex: /\btext-slate-600(?![\/\w\-])/g, replace: 'text-slate-600 dark:text-purple-300' },
  { regex: /\btext-slate-500(?![\/\w\-])/g, replace: 'text-slate-500 dark:text-purple-400' },
  { regex: /\btext-slate-400(?![\/\w\-])/g, replace: 'text-slate-400 dark:text-purple-500' },
  { regex: /\bborder-slate-200(?![\/\w\-])/g, replace: 'border-slate-200 dark:border-[#2C2142]' },
  { regex: /\bborder-slate-100(?![\/\w\-])/g, replace: 'border-slate-100 dark:border-[#2C2142]/60' },
  { regex: /\bborder-slate-300(?![\/\w\-])/g, replace: 'border-slate-300 dark:border-[#3A2D54]' },
  { regex: /\bbg-slate-100(?![\/\w\-])/g, replace: 'bg-slate-100 dark:bg-[#1E172E]' },
  { regex: /\bbg-slate-200(?![\/\w\-])/g, replace: 'bg-slate-200 dark:bg-[#2C2142]' },
  { regex: /\bbg-purple-100(?![\/\w\-])/g, replace: 'bg-purple-100 dark:bg-purple-900/40' },
  { regex: /\bbg-green-100(?![\/\w\-])/g, replace: 'bg-green-100 dark:bg-green-900/30' },
  { regex: /\btext-green-800(?![\/\w\-])/g, replace: 'text-green-800 dark:text-green-300' },
  { regex: /\btext-green-700(?![\/\w\-])/g, replace: 'text-green-700 dark:text-green-400' },
  { regex: /\bbg-red-100(?![\/\w\-])/g, replace: 'bg-red-100 dark:bg-red-900/30' },
  { regex: /\btext-red-800(?![\/\w\-])/g, replace: 'text-red-800 dark:text-red-300' },
  { regex: /\btext-red-600(?![\/\w\-])/g, replace: 'text-red-600 dark:text-red-400' },
  { regex: /\bhover:bg-slate-50(?![\/\w\-])/g, replace: 'hover:bg-slate-50 dark:hover:bg-[#1E172E]' },
  { regex: /\bhover:bg-slate-100(?![\/\w\-])/g, replace: 'hover:bg-slate-100 dark:hover:bg-[#2C2142]' },
  { regex: /\bfrom-purple-100\/50(?![\/\w\-])/g, replace: 'from-purple-100/50 dark:from-purple-900/20' },
  { regex: /\bbg-purple-300\/20(?![\/\w\-])/g, replace: 'bg-purple-300/20 dark:bg-purple-500/10' },
  { regex: /\bshadow-sm(?![\/\w\-])/g, replace: 'shadow-sm dark:shadow-none' },
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });
  
  // Clean up duplicates if any
  replacements.forEach(({ replace }) => {
     const double = replace + ' ' + replace.split(' ')[1];
     content = content.replace(new RegExp(double.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
