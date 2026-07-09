const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace("Create a Student or Lecturer Account", "Create a Student Account");

fs.writeFileSync('src/pages/Login.tsx', code);
