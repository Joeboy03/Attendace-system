const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
content = content.replace(
  'Mock Scan</button>',
  `Mock Scan</button>\n            <button onClick={async () => {\n              const { data } = await supabase.from('attendance_sessions').select('*').eq('is_active', true).limit(1);\n              if (data && data.length > 0) {\n                onScanSuccess(JSON.stringify({ sessionId: data[0].id, token: data[0].session_token }), null);\n              } else {\n                alert('No active sessions found!');\n              }\n            }} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors">Auto Mock Scan</button>`
);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
