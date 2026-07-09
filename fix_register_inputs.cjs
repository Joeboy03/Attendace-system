const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Update useEffect for finding departments to be case-insensitive
code = code.replace(
  "const f = facultiesList.find(fac => fac.name === faculty);",
  "const f = facultiesList.find(fac => fac.name.toLowerCase() === faculty.toLowerCase());"
);

// Update handleRegister to include validation
const validationCode = `
    const selectedFac = facultiesList.find(f => f.name.toLowerCase() === faculty.toLowerCase());
    if (!selectedFac) {
      setError('The entered faculty does not exist.');
      setLoading(false);
      return;
    }
    
    const selectedDept = departmentsList.find(d => d.name.toLowerCase() === department.toLowerCase());
    if (!selectedDept) {
      setError('The entered department does not exist in the selected faculty.');
      setLoading(false);
      return;
    }
    
    try {
      // 1. Create the user in Supabase Auth
`;

code = code.replace("    try {\n      // 1. Create the user in Supabase Auth", validationCode);

// Update database insert to use the exact matched names
code = code.replace(
  "          faculty: faculty,\n          department: department",
  "          faculty: selectedFac.name,\n          department: selectedDept.name"
);

// Replace Faculty Select with Input
const facultySelect = `<select
                        required
                        value={faculty}
                        onChange={(e) => { setFaculty(e.target.value); setDepartment(''); }}
                        className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors appearance-none"
                    >
                        <option value="" disabled>Select Faculty</option>
                        {facultiesList.map(fac => (
                          <option key={fac.id} value={fac.name}>{fac.name}</option>
                        ))}
                    </select>`;

const facultyInput = `<input
                        type="text"
                        required
                        list="faculty-list"
                        value={faculty}
                        onChange={(e) => { setFaculty(e.target.value); setDepartment(''); }}
                        placeholder="Type faculty name"
                        className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors"
                    />
                    <datalist id="faculty-list">
                        {facultiesList.map(fac => (
                          <option key={fac.id} value={fac.name} />
                        ))}
                    </datalist>`;

code = code.replace(facultySelect, facultyInput);


// Replace Department Select with Input
const deptSelect = `<select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors appearance-none"
                    disabled={!faculty}
                >
                    <option value="" disabled>Select Department</option>
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                </select>`;

const deptInput = `<input
                    type="text"
                    required
                    list="dept-list"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Type department name"
                    className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors disabled:opacity-50"
                    disabled={!faculty}
                />
                <datalist id="dept-list">
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name} />
                    ))}
                </datalist>`;

code = code.replace(deptSelect, deptInput);

fs.writeFileSync('src/pages/Register.tsx', code);
