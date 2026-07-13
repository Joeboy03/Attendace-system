const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

if (!content.includes('newCourseLevel')) {
  content = content.replace(
    "const [newCourseDepartment, setNewCourseDepartment] = useState('');",
    "const [newCourseDepartment, setNewCourseDepartment] = useState('');\n  const [newCourseLevel, setNewCourseLevel] = useState('100');\n  const [newCourseSemester, setNewCourseSemester] = useState('1st');\n  const [newCourseType, setNewCourseType] = useState('Core');"
  );

  content = content.replace(
    "faculty: newCourseFaculty,",
    "faculty: newCourseFaculty,\n        level: newCourseLevel,\n        semester: newCourseSemester,\n        course_type: newCourseType,"
  );
  
  content = content.replace(
    "delete insertData.department;",
    "delete insertData.department;\n        delete insertData.level;\n        delete insertData.semester;\n        delete insertData.course_type;"
  );

  const uiToAdd = `
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Level</label>
                <select
                  value={newCourseLevel}
                  onChange={(e) => setNewCourseLevel(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="600">600 Level</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Semester</label>
                <select
                  value={newCourseSemester}
                  onChange={(e) => setNewCourseSemester(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Type</label>
                <select
                  value={newCourseType}
                  onChange={(e) => setNewCourseType(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                  <option value="Mandatory">Mandatory</option>
                </select>
              </div>
            </div>
  `;
  
  content = content.replace(
    /(<div>\s*<label[^>]*>Assign Lecturer<\/label>)/,
    uiToAdd + "\n            $1"
  );

  fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
}
