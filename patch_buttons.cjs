const fs = require('fs');
let code = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

code = code.replace(
    /Send <ArrowUpRight size=\{14\} \/>/g,
    'Export CSV'
);

code = code.replace(
    /Receive <ArrowDownRight size=\{14\} \/>/g,
    'Export PDF'
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', code);
