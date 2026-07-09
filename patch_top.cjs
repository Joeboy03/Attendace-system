const fs = require('fs');

let content = fs.readFileSync('top_part.tsx', 'utf8');

const additionalLogic = `
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!profile) return;
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select(\`
            id,
            signed_at,
            attendance_sessions (
              id,
              courses (
                course_code,
                course_title
              )
            )
          \`)
          .eq('student_id', profile.id)
          .order('signed_at', { ascending: false });
        
        if (error) throw error;
        setAttendanceHistory(data || []);
      } catch (err) {
        console.error('Error fetching attendance history:', err);
      }
    };
    fetchAttendanceHistory();
  }, [profile]);
`;

content = content + "\n" + additionalLogic;

fs.writeFileSync('top_part.tsx', content);
