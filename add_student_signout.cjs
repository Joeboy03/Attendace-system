const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const targetStr = `
            <button 
              onClick={() => setScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#60D8B6] text-slate-900 rounded-xl text-sm font-bold hover:bg-[#4bc2a0] transition-colors"
            >
              <Camera className="w-4 h-4" /> Scan QR Code
            </button>
          </div>
`;

const replacementStr = `
            <button 
              onClick={() => setScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#60D8B6] text-slate-900 rounded-xl text-sm font-bold hover:bg-[#4bc2a0] transition-colors"
            >
              <Camera className="w-4 h-4" /> Scan QR Code
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
`;

code = code.replace(targetStr.trim(), replacementStr.trim());
fs.writeFileSync('src/pages/StudentDashboard.tsx', code);
