const fs = require('fs');

let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const selectOld = 'className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"';
const selectNew = 'className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors appearance-none"';

code = code.split(selectOld).join(selectNew);

// add required to faculty
code = code.replace(
  '<select\n                                    value={faculty}',
  '<select\n                                    required\n                                    value={faculty}'
);

fs.writeFileSync('src/pages/Register.tsx', code);
