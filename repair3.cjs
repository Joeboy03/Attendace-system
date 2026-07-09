const fs = require('fs');
let text = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf-8');

text = text.replace(
  /department: profile\?\.department \|\| ''\s*const \[facultiesList/m,
  "department: profile?.department || ''\n  });\n  const [facultiesList"
);

text = text.replace(
  /student_id: profile\?\.id\s*if \(insertError\) throw insertError;/m,
  "student_id: profile?.id\n        });\n        if (insertError) throw insertError;"
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', text);
