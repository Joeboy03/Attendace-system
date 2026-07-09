const fs = require('fs');
let text = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf-8');

text = text.replace(
  "    department: profile?.department || ''\n  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);",
  "    department: profile?.department || ''\n  });\n  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);"
);

text = text.replace(
  "          student_id: profile?.id\n              if (insertError) throw insertError;",
  "          student_id: profile?.id\n        });\n              if (insertError) throw insertError;"
);

// We should also check for any other missing `});`.
// I can just check the whole file for `});` and see where it broke.
// Let's replace the other one I know about.

fs.writeFileSync('src/pages/StudentDashboard.tsx', text);
