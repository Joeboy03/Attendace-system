const fs = require('fs');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // replace <button onClick={signOut} with the themeswitcher before it
  content = content.replace(
    /(<button[^>]*onClick=\{signOut\})/g,
    "<ThemeSwitcher />\n          $1"
  );
  
  fs.writeFileSync(file, content);
});
