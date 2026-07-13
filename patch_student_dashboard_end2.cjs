const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const regexToReplace = /\{\/\* Attendance Breakdown \*\/\}[\s\S]*\n\s*\}\);\n\}/m;

const replacement = `{/* Attendance Breakdown */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
             <Target className="w-5 h-5 mr-2 text-purple-500" />
             Course Attendance Summary
          </h4>
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map(enrollment => {
                const courseCode = enrollment.courses?.course_code;
                const courseTitle = enrollment.courses?.course_title;
                const attended = attendanceHistory.filter(record => record.attendance_sessions?.courses?.course_code === courseCode).length;
                return (
                  <div key={enrollment.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex justify-between items-center hover:border-purple-300 transition-colors">
                    <div>
                      <p className="font-bold text-purple-900">{courseCode}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-purple-900">{attended}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Attended</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Bottom Section - Attendance History */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h4 className="text-lg font-bold text-slate-800 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
              Recent Attendance
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attendanceHistory.length === 0 ? (
               <div className="col-span-full py-8 text-center text-slate-500">
                 No attendance records found.
               </div>
            ) : (
              attendanceHistory.slice(0, 6).map(record => {
                const date = new Date(record.signed_at);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                return (
                  <div key={record.id} className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="font-bold text-purple-900">{record.attendance_sessions?.courses?.course_code || 'N/A'}</p>
                         <p className="text-xs text-slate-500 truncate max-w-[150px]">{record.attendance_sessions?.courses?.course_title || 'N/A'}</p>
                       </div>
                       <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md uppercase tracking-wider">Present</span>
                    </div>
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                       <p className="text-xs font-medium text-slate-600 flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/> {formattedDate}</p>
                       <p className="text-xs font-medium text-slate-600 flex items-center"><Clock className="w-3 h-3 mr-1"/> {formattedTime}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Right Column: AI Insights & Scanning */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        
        {/* QR Scanner Section (always visible on desktop, modal on mobile) */}
        {scanning && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-slate-800 flex items-center">
                 <Camera className="w-5 h-5 mr-2 text-purple-500" />
                 Scan Class QR
               </h2>
               <button onClick={() => setScanning(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                 <XCircle className="w-5 h-5" />
               </button>
            </div>
            
            {scanResult && (
              <div className={\`mb-6 p-4 rounded-xl flex items-start \${scanResult.status === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}\`}>
                {scanResult.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <p className="font-medium text-sm">{scanResult.message}</p>
              </div>
            )}
            
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 mx-auto w-full max-w-[280px]">
              <div id="reader" className="w-full rounded-xl overflow-hidden [&>div]:border-none [&_video]:rounded-xl text-slate-600"></div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col min-h-[250px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2">AI Attendance Insights</h2>
              <p className="text-purple-200 text-sm leading-relaxed mb-6">
                {aiInsight || "Attend more classes to generate personalized AI insights about your performance and attendance patterns."}
              </p>
            </div>
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold transition-colors">
              Refresh Insights
            </button>
          </div>
        </div>

      </div>
      
    </div>
  </div>
  );
}
`;

content = content.replace(regexToReplace, replacement);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
