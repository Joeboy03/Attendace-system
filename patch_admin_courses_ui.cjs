const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const uiToAdd = `
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Faculty (Optional for generic)</label>
              <select
                value={newCourseFaculty}
                onChange={(e) => setNewCourseFaculty(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 transition-colors appearance-none"
              >
                <option value="">Select Faculty...</option>
                <option value="Physical Sciences">Physical Sciences</option>
                <option value="Engineering">Engineering</option>
                <option value="Life Sciences">Life Sciences</option>
                <option value="Arts">Arts</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Management Sciences">Management Sciences</option>
                <option value="Education">Education</option>
                <option value="Law">Law</option>
                <option value="Medicine">Medicine</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Environmental Sciences">Environmental Sciences</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">Department (Optional)</label>
              <input
                type="text"
                value={newCourseDepartment}
                onChange={(e) => setNewCourseDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 placeholder-slate-400 transition-colors"
              />
            </div>
`;
  
content = content.replace(
  /(<div>\s*<label[^>]*>Assign Lecturer<\/label>)/,
  uiToAdd + "\n            $1"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
