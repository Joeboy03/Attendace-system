const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');
content = content.replace(
  'xl:col-span-2 bg-white',
  'md:col-span-2 xl:col-span-2 bg-white'
);
content = content.replace(
  'xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-sm',
  'md:col-span-1 xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-sm'
);
content = content.replace(
  'xl:col-span-1 bg-purple-900',
  'md:col-span-1 xl:col-span-1 bg-purple-900'
);
content = content.replace(
  'xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col min-h-[250px]',
  'md:col-span-2 xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col min-h-[250px]'
);
content = content.replace(
  'xl:col-span-3 bg-white',
  'md:col-span-2 xl:col-span-3 bg-white'
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
