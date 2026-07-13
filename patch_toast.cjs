const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

if (!content.includes('import toast from')) {
  content = content.replace(
    "import { LogOut",
    "import toast from 'react-hot-toast';\nimport { LogOut"
  );
}

content = content.replace(/alert\('Update posted successfully!'\);/g, "toast.success('Update posted successfully!');");
content = content.replace(/alert\('Failed to post update.'\);/g, "toast.error('Failed to post update.');");

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
