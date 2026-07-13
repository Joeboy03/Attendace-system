const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(
  '    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-6 flex flex-col items-center justify-center">',
  '    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-600 font-sans p-6 flex flex-col items-center justify-center">\n      {/* Background decorations */}\n      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-300/30 blur-[100px] pointer-events-none" />\n      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/30 blur-[100px] pointer-events-none" />'
);

content = content.replace(
  '<div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center">',
  '<div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-purple-900/5 p-10 flex flex-col items-center relative z-10">'
);

content = content.replace(
  '<div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-purple-600 mb-6 transform rotate-3">',
  '<div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform">'
);
content = content.replace(
  '<GraduationCap className="w-8 h-8 -rotate-3" />',
  '<GraduationCap className="w-10 h-10 -rotate-3" />'
);

content = content.replace(
  'text-2xl font-bold tracking-tight text-purple-900 mb-1',
  'text-3xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900 mb-2'
);

content = content.replace(
  'className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"',
  'className="w-full pl-5 pr-5 py-4 text-sm font-medium border-2 border-slate-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all"'
).replace(
  'className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"',
  'className="w-full pl-5 pr-5 py-4 text-sm font-medium border-2 border-slate-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all"'
);

content = content.replace(
  'className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white disabled:opacity-50 transition-colors mt-2"',
  'className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20 mt-4"'
);

fs.writeFileSync('src/pages/Login.tsx', content);
