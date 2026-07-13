const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

content = content.replace(
  '{!activeSession ? (\n              <div className="flex items-center gap-2 mt-4 mb-2">',
  '{!activeSession ? (\n              <>\n                <div className="flex items-center gap-2 mt-4 mb-2">'
);

content = content.replace(
  '                Start Session\n              </button>\n            ) : (',
  '                Start Session\n              </button>\n              </>\n            ) : ('
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
