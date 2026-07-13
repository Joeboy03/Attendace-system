const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const deleteHandler = `
  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This will also delete related attendance records and schedules.")) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  };
`;
content = content.replace(
  "  const handleCreateCourse = async (e: React.FormEvent) => {",
  deleteHandler + "\n  const handleCreateCourse = async (e: React.FormEvent) => {"
);

const deleteButton = `                  </div>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors flex-shrink-0"
                    title="Delete Course"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>`;
content = content.replace(
  `                  </div>
                </div>`,
  deleteButton
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
