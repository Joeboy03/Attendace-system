const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
content = content.replace(/hover:border-slate-600/g, 'hover:border-purple-300');
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
