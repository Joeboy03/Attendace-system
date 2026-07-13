const fs = require('fs');

const filesToUpdate = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
      'shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform">U</div>',
      'shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform"><Fingerprint className="w-8 h-8 -rotate-3" /></div>'
    );
    
    fs.writeFileSync(file, content);
  }
});
