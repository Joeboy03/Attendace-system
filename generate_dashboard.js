const fs = require('fs');

const content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
console.log(content.indexOf('return ('));
