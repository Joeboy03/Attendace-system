const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

if (!content.includes('availableCourses')) {
  content = content.replace(
    "const [schedules, setSchedules] = useState<ClassSchedule[]>([]);",
    "const [schedules, setSchedules] = useState<ClassSchedule[]>([]);\n  const [availableCourses, setAvailableCourses] = useState<any[]>([]);\n  const [isRegistering, setIsRegistering] = useState(false);\n  const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');"
  );
  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
