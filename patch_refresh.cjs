const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

content = content.replace(
  'const [insightLoading, setInsightLoading] = useState(false);',
  'const [insightLoading, setInsightLoading] = useState(false);\n  const [refreshKey, setRefreshKey] = useState(0);'
);

content = content.replace(
  '  useEffect(() => {\n    const fetchAttendanceHistory',
  '  useEffect(() => {\n    const fetchAttendanceHistory'
);

content = content.replace(
  '  }, [profile]);',
  '  }, [profile, refreshKey]);'
);

content = content.replace(
  "const fetchEvent = new Event('refreshAttendance');\n            document.dispatchEvent(fetchEvent);",
  'setRefreshKey(prev => prev + 1);'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
