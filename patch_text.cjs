const fs = require('fs');
let code = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

code = code.replace(
    /<h3 className="text-\[28px\] font-bold text-slate-800">\$32,678.90<\/h3>/g, 
    '<h3 className="text-[28px] font-bold text-slate-800">86.5%</h3>'
);

code = code.replace(
    /<p className="text-slate-500 text-xs font-medium">Total Balance<\/p>/g,
    '<p className="text-slate-500 text-xs font-medium">Average Attendance</p>'
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', code);
