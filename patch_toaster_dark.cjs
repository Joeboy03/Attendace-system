const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<Toaster />',
  '<Toaster toastOptions={{ className: "dark:bg-[#1E172E] dark:text-purple-50 dark:border dark:border-[#2C2142]" }} />'
);

fs.writeFileSync('src/App.tsx', content);
