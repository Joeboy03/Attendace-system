const fs = require('fs');

const file = 'src/pages/StudentDashboard.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-slate-800/g, 'bg-purple-100');
  fs.writeFileSync(file, content);
}
