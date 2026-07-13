const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

if (!content.includes('filterLevel')) {
  content = content.replace(
    "const [filterDepartment, setFilterDepartment] = useState(profile?.department || '');",
    "const [filterDepartment, setFilterDepartment] = useState(profile?.department || '');\n  const [filterLevel, setFilterLevel] = useState(profile?.level || '100');\n  const [filterSemester, setFilterSemester] = useState('1st');"
  );
  
  content = content.replace(
    /\{availableCourses\.filter\(c => !enrolledCourses\.find\(e => e\.course_id === c\.id\) && \(filterDepartment \? \(c\.department\?\.toLowerCase\(\) === filterDepartment\.toLowerCase\(\) \|\| !c\.department\) : true\)\)\.map/,
    `{availableCourses.filter(c => !enrolledCourses.find(e => e.course_id === c.id) && (filterDepartment ? (c.department?.toLowerCase() === filterDepartment.toLowerCase() || !c.department) : true) && (c.level ? c.level === filterLevel : true) && (c.semester ? c.semester === filterSemester : true)).map`
  );
  
  const filterInputs = `
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Department</label>
                <input
                  type="text"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full pl-4 pr-4 py-2 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 placeholder-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Level</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
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
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
            </div>
  `;
  
  content = content.replace(
    /(<div className="mb-4">\s*<label[^>]*>Filter by Department<\/label>[\s\S]*?<\/div>\s*)<div className="flex flex-col sm:flex-row gap-4">/,
    filterInputs + '\n            <div className="flex flex-col sm:flex-row gap-4">'
  );

  content = content.replace(
    /\{course.course_code\} - \{course.course_title\} \{course.department \? `\(\$\{course.department\}\)` : ''\}/g,
    `{course.course_code} - {course.course_title} {course.course_type ? \`[\${course.course_type}]\` : ''}`
  );

  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
