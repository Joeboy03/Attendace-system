const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

// Replace top header
content = content.replace(
  '<header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">',
  '<header className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-purple-900/5 border border-white/50 relative z-10">'
);
content = content.replace(
  '<div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center text-white font-bold text-xl">U</div>',
  '<div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform">U</div>'
);
content = content.replace(
  '<h1 className="text-xl font-bold tracking-tight text-purple-900">University of Benin</h1>',
  '<h1 className="text-2xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900">University of Benin</h1>'
);
content = content.replace(
  '<button \n            onClick={signOut}\n            className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 hover:bg-purple-200 transition-colors"\n            title="Sign Out"\n          >\n            <LogOut className="w-5 h-5" />\n          </button>',
  '<button \n            onClick={signOut}\n            className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"\n            title="Sign Out"\n          >\n            <LogOut className="w-5 h-5" />\n          </button>'
);

// Add background decoration to main wrapper
content = content.replace(
  '<div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 flex flex-col">',
  '<div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">\n      {/* Background decorations */}\n      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100/50 to-transparent pointer-events-none" />\n      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-[100px] pointer-events-none" />\n'
);

// Stat Cards
content = content.replace(
  /className="bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm"/g,
  'className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform relative overflow-hidden group"'
);
content = content.replace(
  /<span className="text-5xl font-black text-purple-900 mt-2">/g,
  '<span className="text-5xl font-[Space_Grotesk] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700 mt-2">'
);

// Panels
content = content.replace(
  /className="xl:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm"/g,
  'className="xl:col-span-8 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-8 shadow-xl shadow-purple-900/5 flex flex-col"'
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
