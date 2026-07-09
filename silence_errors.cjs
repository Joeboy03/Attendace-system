const fs = require('fs');
let code = fs.readFileSync('src/lib/departments.ts', 'utf8');

code = code.replace(/console\.error\('Error fetching faculties:', error\);/g, "// silenced");
code = code.replace(/console\.error\('Error fetching departments:', error\);/g, "// silenced");
code = code.replace(/console\.error\('Error creating faculty:', error\);/g, "// silenced");
code = code.replace(/console\.error\('Error creating department:', error\);/g, "// silenced");

fs.writeFileSync('src/lib/departments.ts', code);
