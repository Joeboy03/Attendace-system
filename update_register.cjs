const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace background color classes in return statement
code = code.replace(/className="min-h-screen bg-slate-50 text-slate-900/g, 'className="min-h-screen bg-[#18191B] text-slate-300');
code = code.replace(/className="bg-white rounded-3xl border-2 border-slate-200 p-8/g, 'className="bg-[#232427] rounded-3xl border border-slate-800 p-8');
code = code.replace(/bg-indigo-900 rounded-2xl/g, 'bg-[#2D2E32] border border-slate-700 rounded-2xl');
code = code.replace(/text-white mb-6/g, 'text-[#60D8B6] mb-6');
code = code.replace(/className="w-8 h-8 text-white/g, 'className="w-8 h-8');

code = code.replace(/text-indigo-900/g, 'text-white');
code = code.replace(/text-slate-500/g, 'text-slate-400');
code = code.replace(/text-slate-700/g, 'text-slate-400');

// Input styles
const inputOld = "className=\"w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors\"";
const inputNew = "className=\"w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors\"";
code = code.split(inputOld).join(inputNew);

// Error message
code = code.replace(/className="text-red-600 bg-red-50 border border-red-200/g, 'className="text-red-400 bg-red-500/10 border border-red-500/20');

// Buttons
code = code.replace(/className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl border-2 transition-colors \${role === 'student' \? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"/g, 
  'className={`flex-1 flex justify-center items-center py-3 px-4 rounded-xl border transition-colors ${role === \'student\' ? \'border-[#60D8B6] bg-[#60D8B6]/10 text-[#60D8B6]\' : \'border-slate-700 bg-[#18191B] text-slate-400 hover:bg-slate-800\'}`}');

code = code.replace(/className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl border-2 transition-colors \${role === 'lecturer' \? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"/g, 
  'className={`flex-1 flex justify-center items-center py-3 px-4 rounded-xl border transition-colors ${role === \'lecturer\' ? \'border-[#60D8B6] bg-[#60D8B6]/10 text-[#60D8B6]\' : \'border-slate-700 bg-[#18191B] text-slate-400 hover:bg-slate-800\'}`}');

code = code.replace(/className="w-full flex justify-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-2"/g,
  'className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-[#18191B] bg-[#60D8B6] hover:bg-[#4bc2a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60D8B6] focus:ring-offset-[#232427] disabled:opacity-50 transition-colors mt-2"');

// Footer & link
code = code.replace(/border-slate-100/g, 'border-slate-800');
code = code.replace(/text-indigo-600 hover:text-indigo-800/g, 'text-[#60D8B6] hover:text-[#4bc2a0]');

fs.writeFileSync('src/pages/Register.tsx', code);
