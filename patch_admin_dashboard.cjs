const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// We will add a new tab or form for "Create Lecturer"
const newImports = `import { UserPlus } from 'lucide-react';\n`;
if (!code.includes('UserPlus')) {
  code = code.replace("import { LogOut, Shield, Users", "import { LogOut, Shield, Users, UserPlus");
}

const stateInsert = `
  // Lecturer State
  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('');
  const [newLecturerStaffId, setNewLecturerStaffId] = useState('');
  const [lecturerLoading, setLecturerLoading] = useState(false);
  const [lecturerMessage, setLecturerMessage] = useState({ type: '', text: '' });
`;

if (!code.includes('newLecturerName')) {
  code = code.replace("const [stats, setStats] = useState", stateInsert + "\n  const [stats, setStats] = useState");
}

const handleCreateLecturer = `
  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLecturerLoading(true);
    setLecturerMessage({ type: '', text: '' });
    
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newLecturerEmail,
        password: newLecturerPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add to users table
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: newLecturerName,
          email: newLecturerEmail,
          role: 'lecturer',
          staff_id: newLecturerStaffId,
        });

        if (dbError) throw dbError;
        
        setLecturerMessage({ type: 'success', text: 'Lecturer created successfully! Note: You may have been logged out due to client-side auth limits.' });
        setNewLecturerName('');
        setNewLecturerEmail('');
        setNewLecturerPassword('');
        setNewLecturerStaffId('');
        fetchDashboardData();
      }
    } catch (error: any) {
      setLecturerMessage({ type: 'error', text: error.message || 'Failed to create lecturer.' });
    } finally {
      setLecturerLoading(false);
    }
  };
`;

if (!code.includes('handleCreateLecturer')) {
  code = code.replace("const handleCreateCourse", handleCreateLecturer + "\n  const handleCreateCourse");
}

const createLecturerForm = `
        {/* Create Lecturer Form */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Create Lecturer</h2>
          
          {lecturerMessage.text && (
            <div className={\`mb-6 p-4 rounded-xl flex items-start \${lecturerMessage.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}\`}>
              {lecturerMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{lecturerMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateLecturer} className="space-y-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={newLecturerName}
                onChange={(e) => setNewLecturerName(e.target.value)}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Staff ID</label>
              <input
                type="text"
                required
                value={newLecturerStaffId}
                onChange={(e) => setNewLecturerStaffId(e.target.value)}
                placeholder="e.g. L-12345"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={newLecturerEmail}
                onChange={(e) => setNewLecturerEmail(e.target.value)}
                placeholder="lecturer@uniben.edu"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={newLecturerPassword}
                onChange={(e) => setNewLecturerPassword(e.target.value)}
                placeholder="Assign password"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={lecturerLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-6"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {lecturerLoading ? 'Creating...' : 'Add Lecturer'}
            </button>
          </form>
        </div>
`;

if (!code.includes('Create Lecturer Form')) {
  // Let's replace the first element inside the grid that holds Create Course Form, and push it in there
  code = code.replace("{/* Create Course Form */}", createLecturerForm + "\n        {/* Create Course Form */}");
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
