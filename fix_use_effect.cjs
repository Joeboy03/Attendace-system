const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

code = code.replace(
  "const f = facultiesList.find(fac => fac.name === faculty);",
  "const f = facultiesList.find(fac => fac.name.toLowerCase() === faculty.toLowerCase());"
);

fs.writeFileSync('src/pages/Register.tsx', code);
