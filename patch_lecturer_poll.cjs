const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

const newEffect = `
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && selectedCourse) {
      interval = setInterval(() => {
        fetchRecentAttendees(selectedCourse);
        fetchSessionStats(selectedCourse);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, selectedCourse]);
`;

content = content.replace(
  '  useEffect(() => {\n    fetchCourses();',
  newEffect + '\n  useEffect(() => {\n    fetchCourses();'
);

fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
