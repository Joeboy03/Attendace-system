const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// 1. Add state
const stateDeclarations = `
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
`;
content = content.replace('const [profileUpdateMsg, setProfileUpdateMsg] = useState', stateDeclarations + '\n  const [profileUpdateMsg, setProfileUpdateMsg] = useState');

// 2. Set Points and Streak in fetchAttendanceHistory
const fetchHistReplacement = `
        if (data) {
          setAttendanceHistory(data);
          setPoints(data.length * 10);
          const uniqueDays = new Set(data.map(r => new Date(r.signed_at).toDateString()));
          setStreak(uniqueDays.size);
        }
`;
content = content.replace('if (data) setAttendanceHistory(data);', fetchHistReplacement);

// 3. Add AI Fetching Effect
const aiEffect = `
  useEffect(() => {
    const getAiInsight = async () => {
      if (!profile) return;
      setInsightLoading(true);
      try {
        const response = await fetch('/api/ai/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendanceHistory, studentInfo: profile })
        });
        const result = await response.json();
        setAiInsight(result.prediction);
      } catch(e) {
         console.error(e);
      } finally {
        setInsightLoading(false);
      }
    };
    if (attendanceHistory.length > 0) {
      getAiInsight();
    }
  }, [attendanceHistory.length]);
`;
content = content.replace('  return (', aiEffect + '\n  return (');

// 4. Update the Top Section with Gamification
const gamificationUI = `
                <div className="flex gap-4 mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xl font-black text-purple-900">{points}</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Points</span>
                  </div>
                  <div className="w-px bg-purple-200"></div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xl font-black text-purple-900">{streak} 🔥</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Day Streak</span>
                  </div>
                  <div className="w-px bg-purple-200"></div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xl font-black text-purple-900">{Math.floor(points/100)}</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Badges</span>
                  </div>
                </div>
`;
content = content.replace(
  '<div className="w-full xl:w-auto flex flex-col gap-3">',
  gamificationUI + '\n                <div className="w-full xl:w-auto flex flex-col gap-3">'
);

// 5. Add AI Insight Section below the profile
const insightUI = `
      {/* AI Insights Panel */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 shadow-xl shadow-purple-900/10 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20 flex-shrink-0 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-[Space_Grotesk] font-bold text-white mb-2 flex items-center gap-2">
              AI Academic Insight
              <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/30 rounded-full text-[9px] font-black tracking-widest text-purple-200 uppercase">Beta</span>
            </h3>
            {insightLoading ? (
              <div className="flex space-x-2 items-center h-6">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <p className="text-sm font-medium text-purple-100 leading-relaxed max-w-3xl">
                {aiInsight || "Attend your first class to receive personalized AI academic insights and predictions based on your engagement."}
              </p>
            )}
          </div>
        </div>
      </div>
`;
content = content.replace(
  '{/* Middle Section - Course Stats and Quick Scan */}',
  insightUI + '\n      {/* Middle Section - Course Stats and Quick Scan */}'
);

fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
