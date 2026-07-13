const fs = require('fs');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // add import if not exists
  if (!content.includes('ThemeSwitcher')) {
    content = content.replace(
      "import { supabase } from '../lib/supabase';",
      "import { supabase } from '../lib/supabase';\nimport ThemeSwitcher from '../components/ThemeSwitcher';"
    );
  }
  
  // find the logout button which usually has 'bg-red-50 text-red-600'
  // we want to place it in the same flex container as the logout button
  content = content.replace(
    /(<button[^>]*onClick=\{handleSignOut\})/g,
    "<ThemeSwitcher />\n          $1"
  );
  
  fs.writeFileSync(file, content);
});
