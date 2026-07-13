const fs = require('fs');

const filesToUpdate = [
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Change year
    content = content.replace(/2024 University/g, '2026 University');
    
    // Import Fingerprint
    if (!content.includes('Fingerprint')) {
      content = content.replace('import { GraduationCap }', 'import { GraduationCap, Fingerprint }');
      content = content.replace('import { ', 'import { Fingerprint, ');
    }
    
    // Replace Logo icon
    // In Login/Register:
    content = content.replace(/<GraduationCap className="w-10 h-10 -rotate-3" \/>/g, '<Fingerprint className="w-10 h-10 -rotate-3" />');
    content = content.replace(/<GraduationCap className="w-8 h-8 -rotate-3" \/>/g, '<Fingerprint className="w-8 h-8 -rotate-3" />');
    
    fs.writeFileSync(file, content);
  }
});
