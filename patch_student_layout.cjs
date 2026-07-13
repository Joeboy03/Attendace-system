const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const returnStatementOld = `  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-6 flex flex-col gap-6">
      
      {/* Top Section - Student Profile */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/50 shadow-xl shadow-purple-900/5">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-purple-900">Student Profile</h2>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors text-purple-900">
              This Year <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            <button 
              onClick={() => setScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-900 text-white rounded-xl text-sm font-bold hover:bg-purple-800 transition-colors"
            >
              <Camera className="w-4 h-4" /> Scan QR Code
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
          <div className="flex items-center gap-6">
            <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="lg" />
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">{profile?.full_name || 'Student Name'}</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Matric Number</p>
                  <p className="text-sm font-medium text-purple-900">{profile?.matric_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Level / Department</p>
                  <p className="text-sm font-medium text-purple-900">{profile?.level} • {profile?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-purple-900">{profile?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}`;

const returnStatementNew = `  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden gap-6">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-purple-900/5 border border-white/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform"><Fingerprint className="w-8 h-8 -rotate-3" /></div>
          <div>
            <h1 className="text-2xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900">University of Benin</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attendance Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="sm" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
            <p className="text-xs text-purple-600 font-medium">{profile?.matric_number}</p>
          </div>
          <button 
            onClick={signOut}
            className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-grow relative z-10">
        
        {/* Left Column: Student Profile & Stats */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{profile?.full_name || 'Student Name'}</h3>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level</span>
                    <span className="text-sm font-semibold text-purple-900">{profile?.level || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</span>
                    <span className="text-sm font-semibold text-purple-900">{profile?.department || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setScanning(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-purple-900 text-white rounded-xl text-sm font-bold hover:bg-purple-800 transition-colors shadow-md"
            >
              <Camera className="w-5 h-5" /> Scan QR Code
            </button>
          </div>

          {/* Stats row */}`;

content = content.replace(returnStatementOld, returnStatementNew);
fs.writeFileSync('src/pages/StudentDashboard.tsx', content);
