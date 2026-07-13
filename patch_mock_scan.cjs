const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
content = content.replace(
  '<Camera className="w-4 h-4" /> Scan QR Code\n            </button>',
  `<Camera className="w-4 h-4" /> Scan QR Code\n            </button>\n            <button onClick={() => {\n              const testSessionId = prompt('Session ID:');\n              const testToken = prompt('Token:');\n              if (testSessionId && testToken) onScanSuccess(JSON.stringify({ sessionId: testSessionId, token: testToken }), null);\n            }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 transition-colors">Mock Scan</button>`
);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
