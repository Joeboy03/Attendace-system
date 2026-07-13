const fs = require('fs');
let content = fs.readFileSync('src/pages/LecturerDashboard.tsx', 'utf8');

if (!content.includes('updateMessage')) {
  content = content.replace(
    "const [demographicStats, setDemographicStats] = useState<{faculty: string, count: number}[]>([]);",
    "const [demographicStats, setDemographicStats] = useState<{faculty: string, count: number}[]>([]);\n  const [updateMessage, setUpdateMessage] = useState('');\n  const [isPostingUpdate, setIsPostingUpdate] = useState(false);"
  );
  
  // Add handlePostUpdate function
  const functionToAdd = `
  const handlePostUpdate = async () => {
    if (!selectedCourse || !updateMessage.trim()) return;
    setIsPostingUpdate(true);
    try {
      const course = courses.find(c => c.id === selectedCourse);
      await supabase.channel('uniben_updates').send({
        type: 'broadcast',
        event: 'lecturer_update',
        payload: {
          message: updateMessage,
          course_code: course?.course_code,
          course_id: selectedCourse
        }
      });
      setUpdateMessage('');
      alert('Update posted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to post update.');
    } finally {
      setIsPostingUpdate(false);
    }
  };
`;
  
  content = content.replace(
    "const handleStartSession = async () => {",
    functionToAdd + "\n  const handleStartSession = async () => {"
  );
  
  // Now add the UI below the "Require Dynamic Geofencing" section.
  // The section ends with </button> </div>
  const uiToAdd = `
              {/* Push Update Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#2C2142]/60">
                <h3 className="text-sm font-bold text-slate-800 dark:text-purple-100 mb-3 uppercase tracking-wider">Push Announcement</h3>
                <textarea 
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="e.g. Class is moving to Hall 2 today..."
                  className="w-full p-3 text-sm border-2 border-slate-200 dark:border-[#2C2142] focus:outline-none focus:border-purple-500 rounded-xl bg-slate-50 dark:bg-[#1E172E] text-slate-800 dark:text-purple-50 mb-3 resize-none h-20"
                />
                <button
                  onClick={handlePostUpdate}
                  disabled={!selectedCourse || !updateMessage.trim() || isPostingUpdate}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isPostingUpdate ? 'Posting...' : 'Push Notification'}
                </button>
              </div>
  `;
  
  content = content.replace(
    /(<button[^>]*onClick=\{handleStartSession\}[^>]*>[\s\S]*?<\/button>)/,
    "$1" + uiToAdd
  );
  
  fs.writeFileSync('src/pages/LecturerDashboard.tsx', content);
}
