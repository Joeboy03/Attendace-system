const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

if (!content.includes('Course Registration')) {
  // Add state for available courses and selected course
  content = content.replace(
    "const [schedules, setSchedules] = useState<any[]>([]);",
    "const [schedules, setSchedules] = useState<any[]>([]);\n  const [availableCourses, setAvailableCourses] = useState<any[]>([]);\n  const [isRegistering, setIsRegistering] = useState(false);\n  const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');"
  );
  
  // Add fetchAvailableCourses
  const fn = `
  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('course_code', { ascending: true });
      if (data) setAvailableCourses(data);
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    fetchAvailableCourses();
  }, []);
  
  const handleRegisterCourse = async () => {
    if (!selectedCourseToRegister || !profile) return;
    setIsRegistering(true);
    try {
      // check if already enrolled
      if (enrolledCourses.find(c => c.course_id === selectedCourseToRegister)) {
        toast.error('Already registered for this course');
        setIsRegistering(false);
        return;
      }
      
      const { error } = await supabase.from('enrollments').insert({
        student_id: profile.id,
        course_id: selectedCourseToRegister
      });
      if (error) throw error;
      toast.success('Successfully registered for course!');
      fetchEnrollments();
      setSelectedCourseToRegister('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to register course');
    } finally {
      setIsRegistering(false);
    }
  };
`;

  content = content.replace(
    "const fetchEnrollments = async () => {",
    fn + "\n  const fetchEnrollments = async () => {"
  );
  
  const ui = `
          {/* Course Registration */}
          <div className="bg-white dark:bg-[#15111D] rounded-3xl border-2 border-slate-200 dark:border-[#2C2142] p-6 shadow-sm dark:shadow-none mb-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-purple-100 flex items-center mb-4">
              <PlusCircle className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Course Registration
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCourseToRegister}
                onChange={(e) => setSelectedCourseToRegister(e.target.value)}
                className="flex-grow p-3 text-sm border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#1E172E] text-slate-800 dark:text-purple-50"
              >
                <option value="">Select a course to register...</option>
                {availableCourses.filter(c => !enrolledCourses.find(e => e.course_id === c.id)).map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_title} {course.department ? \`(\${course.department})\` : ''}
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
  `;
  
  // Enrolled courses list usually follows this
  // Look for: <h4 className="text-lg font-bold text-slate-800 flex items-center">
  content = content.replace(
    /(<h4 className="text-lg font-bold text-slate-800 dark:text-purple-100 flex items-center">\s*<BookOpen)/,
    ui + "\n          $1"
  );
  
  // Ensure PlusCircle is imported
  if (!content.includes('PlusCircle')) {
    content = content.replace(
      "BookOpen, QrCode",
      "BookOpen, QrCode, PlusCircle"
    );
    // Let's just add it manually via regex if it fails
    content = content.replace(
      "import { LogOut",
      "import { LogOut, PlusCircle"
    );
  }
  
  // ensure toast is imported
  if (!content.includes('import toast')) {
    content = content.replace(
      "import { supabase }",
      "import { supabase }\nimport toast from 'react-hot-toast';"
    );
  }

  fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
}
