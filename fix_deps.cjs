const fs = require('fs');
let code = fs.readFileSync('src/lib/departments.ts', 'utf8');

code = code.replace(/error\.code === '42P01'/g, "error.code === '42P01' || error.code === 'PGRST205'");

fs.writeFileSync('src/lib/departments.ts', code);
