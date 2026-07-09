const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

code = code.replace(
  "          role: role,\n          matric_number: role === 'student' ? matricNumber : null,\n          staff_id: role === 'lecturer' ? staffId : null,\n          level: role === 'student' ? level : null,\n          faculty: role === 'student' ? faculty : null,\n          department: role === 'student' ? department : null",
  "          role: 'student',\n          matric_number: matricNumber,\n          staff_id: null,\n          level: level,\n          faculty: faculty,\n          department: department"
);

fs.writeFileSync('src/pages/Register.tsx', code);
