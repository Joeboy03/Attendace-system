const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');
content = content.replace(
  'let sessionToken = uuid;',
  'let sessionToken: string = uuid;'
);
fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
