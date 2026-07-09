const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

code = code.replace(
  />\s*Create Account\s*<\/h2>/,
  ">Student Registration</h2>"
);

code = code.replace(
  /'Creating Account\.\.\.' : 'Register Account'/,
  "'Creating Student Account...' : 'Register as Student'"
);

fs.writeFileSync('src/pages/Register.tsx', code);
