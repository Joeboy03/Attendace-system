const fs = require('fs');

let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const statsRowRegex = /(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*)(<\/div>\s*\{\/\* QR Scanner Modal \/ Section \*\/)/;

const newSection = `
        {/* Attendance Breakdown */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Course Attendance Summary</h4>
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map(enrollment => {
                const courseCode = enrollment.courses?.course_code;
                const courseTitle = enrollment.courses?.course_title;
                const attended = attendanceHistory.filter(record => record.attendance_sessions?.courses?.course_code === courseCode).length;
                return (
                  <div key={enrollment.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex justify-between items-center hover:border-purple-300 transition-colors">
                    <div>
                      <p className="font-bold text-purple-900">{courseCode}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-purple-900">{attended}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Attended</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
`;

if (statsRowRegex.test(content)) {
  content = content.replace(statsRowRegex, (match, p1, p2) => {
    return p1 + newSection + p2;
  });
  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
  console.log('Successfully added attendance summary');
} else {
  console.log('Failed to find regex match');
}
