const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
content = content.replace(
  /'bg-purple-900\/20 text-purple-600 border border-purple-200' : 'bg-red-500\/20 text-red-700 border border-red-500\/30'/g,
  "'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'"
);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
