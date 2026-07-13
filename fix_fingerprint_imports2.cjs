const fs = require('fs');

const filesToUpdate = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove all Fingerprint imports first
    content = content.replace(/Fingerprint, /g, '');
    content = content.replace(/, Fingerprint/g, '');
    
    // Then add Fingerprint to lucide-react import
    if (content.includes('lucide-react')) {
       // if there is an import from lucide-react, add Fingerprint to it
       const lucideRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/;
       const match = content.match(lucideRegex);
       if (match) {
         let imports = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0 && s !== 'Fingerprint');
         imports.push('Fingerprint');
         content = content.replace(lucideRegex, `import { ${imports.join(', ')} } from 'lucide-react';`);
       }
    } else {
       // add new import
       content = "import { Fingerprint } from 'lucide-react';\n" + content;
    }
    
    fs.writeFileSync(file, content);
  }
});
