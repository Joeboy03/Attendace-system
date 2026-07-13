const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

content = content.replace(
  '// if (distance > 0.05) throw new Error("You are outside the permitted campus geofence.");',
  'if (distance > 0.05) throw new Error("You are outside the permitted campus geofence. You must be on the UNIBEN campus to sign in.");'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
