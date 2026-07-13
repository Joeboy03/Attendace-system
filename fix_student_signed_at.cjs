const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

content = content.replace(
  /session_id: session\.id,\n\s*student_id: profile\?\.id\n\s*\}/g,
  "session_id: session.id,\n          student_id: profile?.id,\n          signed_at: new Date().toISOString()\n        }"
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
