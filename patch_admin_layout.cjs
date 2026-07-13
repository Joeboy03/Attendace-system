const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(/xl:col-span-12/g, 'md:col-span-2 xl:col-span-12');
content = content.replace(/xl:col-span-4/g, 'md:col-span-2 xl:col-span-4');
content = content.replace(/xl:col-span-8/g, 'md:col-span-2 xl:col-span-8');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
