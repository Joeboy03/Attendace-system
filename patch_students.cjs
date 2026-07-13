const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. State
content = content.replace(
  "const [lecturers, setLecturers] = useState<any[]>([]);",
  "const [lecturers, setLecturers] = useState<any[]>([]);\n  const [students, setStudents] = useState<any[]>([]);"
);

// 2. Fetch
content = content.replace(
  "if (lecturerData) setLecturers(lecturerData);",
  "if (lecturerData) setLecturers(lecturerData);\n\n      const { data: studentData } = await supabase.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false }).limit(100);\n      if (studentData) setStudents(studentData);"
);

// 3. Delete handler
const deleteHandler = `
  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete student');
    }
  };
`;
content = content.replace(
  "const handleDeleteLecturer = async (id: string) => {",
  deleteHandler + "\n  const handleDeleteLecturer = async (id: string) => {"
);

// 4. UI
const studentDirectoryUI = `
        {/* Student Directory */}
        <div className="xl:col-span-12 bg-purple-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-purple-100 uppercase tracking-widest">Student Directory</h2>
             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                {students.length} STUDENTS
             </span>
           </div>
           {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto pr-2">
              {students.map((student) => (
                <div key={student.id} className="p-4 bg-white/10 border-2 border-white/10 rounded-2xl flex items-center justify-between hover:border-white/30 transition-colors">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-black rounded-md">{student.matric_number || 'NO MATRIC'}</span>
                      <p className="text-sm font-bold text-white truncate max-w-[150px]">{student.full_name}</p>
                    </div>
                    <p className="text-xs font-medium text-purple-200 truncate max-w-[200px]">{student.email}</p>
                    <p className="text-[10px] text-purple-300 mt-1 uppercase tracking-widest font-bold">{student.level} • {student.department}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors flex-shrink-0"
                    title="Delete Student"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-purple-300 opacity-70">
              <GraduationCap className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No students registered yet.</p>
            </div>
          )}
        </div>
`;

content = content.replace(
  "{/* Department Management Section */}",
  studentDirectoryUI + "\n\n        {/* Department Management Section */}"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
