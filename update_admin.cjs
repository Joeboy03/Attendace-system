const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Update select query
code = code.replace(
  ".select('id, full_name').eq('role', 'lecturer');",
  ".select('*').eq('role', 'lecturer');"
);

// Insert handleDeleteLecturer
const deleteLecturerStr = `
  const handleDeleteLecturer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lecturer?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete lecturer');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
`;

code = code.replace("  const handleCreateCourse = async (e: React.FormEvent) => {", deleteLecturerStr);


// Insert Lecturer Directory block
const lecturerDirectoryStr = `
        {/* Lecturer Directory */}
        <div className="xl:col-span-8 bg-indigo-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Lecturer Directory</h2>
             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                {lecturers.length} LECTURERS
             </span>
           </div>
           {lecturers.length > 0 ? (
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
              {lecturers.map((lecturer) => (
                <div key={lecturer.id} className="p-4 bg-white/10 border-2 border-white/10 rounded-2xl flex items-center justify-between hover:border-white/30 transition-colors">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-black rounded-md">{lecturer.staff_id || 'NO ID'}</span>
                      <p className="text-sm font-bold text-white">{lecturer.full_name}</p>
                    </div>
                    <p className="text-xs font-medium text-indigo-200">{lecturer.email}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteLecturer(lecturer.id)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors"
                    title="Delete Lecturer"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-indigo-300 opacity-70">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No lecturers have been created yet.</p>
            </div>
          )}
        </div>

        {/* Create Course Form */}
`;

code = code.replace("        {/* Create Course Form */}", lecturerDirectoryStr);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
