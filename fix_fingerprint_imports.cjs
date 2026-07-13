const fs = require('fs');

const filesToUpdate = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/StudentDashboard.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // It probably added Fingerprint to useAuth or similar.
    content = content.replace('import { Fingerprint, useAuth } from \'../contexts/AuthContext\';', 'import { useAuth } from \'../contexts/AuthContext\';');
    content = content.replace('import { Fingerprint, useAuth } from "../contexts/AuthContext";', 'import { useAuth } from "../contexts/AuthContext";');
    content = content.replace('import { Fingerprint, supabase } from \'../lib/supabase\';', 'import { supabase } from \'../lib/supabase\';');
    content = content.replace("import { Fingerprint, useState", "import { useState");
    
    if (!content.includes("Fingerprint } from 'lucide-react'")) {
       content = content.replace("import { ", "import { Fingerprint, ");
    }
    
    fs.writeFileSync(file, content);
  }
});
