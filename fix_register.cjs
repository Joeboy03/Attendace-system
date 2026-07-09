const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace state
code = code.replace("const [role, setRole] = useState<UserRole>('student');", "const role = 'student';");
code = code.replace("const [staffId, setStaffId] = useState('');", "");

// Let's replace the whole `return (` block. We'll find its index.
const returnIndex = code.indexOf('return (');
const scriptPart = code.substring(0, returnIndex);

const newReturn = `return (
    <div className="min-h-screen bg-[#18191B] text-slate-300 font-sans p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        
        <div className="bg-[#232427] rounded-3xl border border-slate-800 p-8 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-[#2D2E32] border border-slate-700 rounded-2xl flex items-center justify-center text-[#60D8B6] mb-6 transform -rotate-3">
            <UserPlus className="w-8 h-8 rotate-3" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">
            Attendance Management System
          </p>
          
          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                placeholder="school@student.uniben.edu"
              />
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Matric Number
                </label>
                <input
                    type="text"
                    required
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                    placeholder="CSC170..."
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Level
                    </label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors appearance-none"
                    >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="500 Level">500 Level</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Faculty
                    </label>
                    <select
                        required
                        value={faculty}
                        onChange={(e) => { setFaculty(e.target.value); setDepartment(''); }}
                        className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white transition-colors appearance-none"
                    >
                        <option value="" disabled>Select Faculty</option>
                        {facultiesList.map(fac => (
                          <option key={fac.id} value={fac.name}>{fac.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Department
                </label>
                <select
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
                </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm font-medium mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-[#18191B] bg-[#60D8B6] hover:bg-[#4bc2a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60D8B6] focus:ring-offset-[#232427] disabled:opacity-50 transition-colors mt-6"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-bold text-[#60D8B6] hover:text-[#4bc2a0] transition-colors">
                Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-500 uppercase font-bold tracking-wider">
          © 2024 University of Benin • CSC Final Year Project
        </p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Register.tsx', scriptPart + newReturn);
