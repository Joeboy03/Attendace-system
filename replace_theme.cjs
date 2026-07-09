const fs = require('fs');

// For Admin, Lecturer, Calendar, Search, Departments
const filesToReplaceIndigo = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/components/Calendar.tsx',
  'src/components/AdminSearch.tsx',
  'src/components/AdminDepartments.tsx'
];

filesToReplaceIndigo.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/indigo/g, 'purple');
    fs.writeFileSync(file, content);
  }
});

// For StudentDashboard, Login, Register, we need to map colors
const darkFiles = [
  'src/pages/StudentDashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx'
];

const colorMap = {
  'bg-[#18191B]': 'bg-slate-50',
  'bg-[#232427]': 'bg-white',
  'bg-[#2D2E32]': 'bg-white',
  'text-slate-300': 'text-slate-600',
  'border-slate-800': 'border-slate-200',
  'border-slate-700': 'border-slate-200',
  'text-white': 'text-purple-900',
  'text-[#60D8B6]': 'text-purple-600',
  'bg-[#60D8B6]': 'bg-purple-900',
  'hover:bg-[#4bc2a0]': 'hover:bg-purple-800',
  'focus:border-[#60D8B6]': 'focus:border-purple-500',
  'focus:ring-[#60D8B6]': 'focus:ring-purple-500',
  'bg-[#60D8B6]/10': 'bg-purple-100',
  'text-slate-500': 'text-slate-500',
  'text-[#18191B]': 'text-white', // Buttons text
  'bg-red-500/10': 'bg-red-100',
  'border-red-500/20': 'border-red-200',
  'text-red-400': 'text-red-700',
  'hover:bg-red-500/20': 'hover:bg-red-200',
  'text-slate-400': 'text-slate-500'
};

darkFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Some specific ones first
    content = content.replace(/className="w-1.5 h-6 bg-\[\#60D8B6\] rounded-full"/g, 'className="w-1.5 h-6 bg-purple-600 rounded-full"');
    content = content.replace(/className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner"/g, 'className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner"');
    
    // Global replaces for mapped classes
    for (const [dark, light] of Object.entries(colorMap)) {
      const regex = new RegExp(dark.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      content = content.replace(regex, light);
    }

    // Specific text colors
    content = content.replace(/text-purple-900 placeholder-slate-500/g, 'text-slate-900 placeholder-slate-400 bg-slate-50');
    content = content.replace(/text-slate-900 rounded-xl/g, 'text-white rounded-xl');

    fs.writeFileSync(file, content);
  }
});
