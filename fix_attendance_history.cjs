const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// Remove the declaration and paste it near the top
const declarationStr = '  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);';

content = content.replace(declarationStr, '');
content = content.replace('  const [scanning, setScanning] = useState(false);', '  const [scanning, setScanning] = useState(false);\n' + declarationStr);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
