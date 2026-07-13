const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const uiToInsert = `
        {/* Course Registration */}
        <div className="bg-white dark:bg-[#15111D] rounded-3xl border-2 border-slate-200 dark:border-[#2C2142] p-6 shadow-sm dark:shadow-none mb-6">
          <h4 className="text-lg font-bold text-slate-800 dark:text-purple-100 flex items-center mb-4">
            <PlusCircle className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Course Registration
          </h4>
          
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCourseToRegister}
              onChange={(e) => setSelectedCourseToRegister(e.target.value)}
              className="flex-grow p-3 text-sm border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#1E172E] text-slate-800 dark:text-purple-50"
            >
              <option value="">Select a course to register...</option>
              {availableCourses.filter(c => !enrolledCourses.find(e => e.course_id === c.id) && (filterDepartment ? (c.department?.toLowerCase() === filterDepartment.toLowerCase() || !c.department) : true) && (c.level ? c.level === filterLevel : true) && (c.semester ? c.semester === filterSemester : true)).map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_title} {course.course_type ? \`[\${course.course_type}]\` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleRegisterCourse}
              disabled={!selectedCourseToRegister || isRegistering}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-md"
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>

        {/* Attendance Breakdown */}
`;

if (!content.includes('Course Registration')) {
  content = content.replace(
    /\{\/\* Attendance Breakdown \*\/\}/,
    uiToInsert
  );
  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
