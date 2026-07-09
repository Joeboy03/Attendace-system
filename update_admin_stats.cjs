const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Add admins to stats state
code = code.replace(
  "const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0 });",
  "const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0, admins: 0 });\n  const [admins, setAdmins] = useState<any[]>([]);"
);

// Add admin state
code = code.replace(
  "// Lecturer State",
  "// Admin State\n  const [newAdminName, setNewAdminName] = useState('');\n  const [newAdminEmail, setNewAdminEmail] = useState('');\n  const [newAdminPassword, setNewAdminPassword] = useState('');\n  const [adminLoading, setAdminLoading] = useState(false);\n  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });\n\n  // Lecturer State"
);

// Add admin count fetch
code = code.replace(
  "const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');",
  "const { count: adminCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');\n      const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');"
);

// Fetch admin list
code = code.replace(
  "// Fetch lecturers for the dropdown",
  "// Fetch admins\n      const { data: adminData } = await supabase.from('users').select('*').eq('role', 'admin');\n      if (adminData) setAdmins(adminData);\n\n      // Fetch lecturers for the dropdown"
);

code = code.replace(
  "students: studentCount || 0,",
  "admins: adminCount || 0,\n        students: studentCount || 0,"
);

// Add handleCreateAdmin
const handleCreateAdminStr = `
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage({ type: '', text: '' });
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: newAdminName,
          email: newAdminEmail,
          role: 'admin',
        });

        if (dbError) throw dbError;
        
        setAdminMessage({ type: 'success', text: 'Admin created successfully! Note: You may have been logged out due to client-side auth limits.' });
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchDashboardData();
      }
    } catch (error: any) {
      setAdminMessage({ type: 'error', text: error.message || 'Failed to create admin.' });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateLecturer = async (e: React.FormEvent) => {
`;
code = code.replace("  const handleCreateLecturer = async (e: React.FormEvent) => {", handleCreateAdminStr);

const handleDeleteAdminStr = `
  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete admin');
    }
  };

  const handleDeleteLecturer = async (id: string) => {
`;
code = code.replace("  const handleDeleteLecturer = async (id: string) => {", handleDeleteAdminStr);


fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
