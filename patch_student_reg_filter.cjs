const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

if (!content.includes('filterDepartment')) {
  content = content.replace(
    "const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');",
    "const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');\n  const [filterDepartment, setFilterDepartment] = useState(profile?.department || '');"
  );
  
  // Update the select to use the filter
  content = content.replace(
    /\{availableCourses\.filter\(c => !enrolledCourses\.find\(e => e\.course_id === c\.id\)\)\.map/,
    `{availableCourses.filter(c => !enrolledCourses.find(e => e.course_id === c.id) && (filterDepartment ? (c.department?.toLowerCase() === filterDepartment.toLowerCase() || !c.department) : true)).map`
  );
  
  // add a department filter input before the select
  const filterInput = `
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Filter by Department</label>
              <input
                type="text"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full sm:max-w-md pl-4 pr-4 py-2 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 placeholder-slate-400 transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
`;
  
  content = content.replace(
    /<div className="flex flex-col sm:flex-row gap-4">/,
    filterInput
  );

  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
