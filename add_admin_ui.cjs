const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Update Stat Cards to span-3 instead of span-4, and add Admins stat
const oldStats = `
        {/* Stat Cards */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> Total Students</span>
          <span className="text-5xl font-black text-indigo-900">{stats.students}</span>
        </div>
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><Users className="w-4 h-4 mr-1" /> Total Lecturers</span>
          <span className="text-5xl font-black text-indigo-900">{stats.lecturers}</span>
        </div>
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Active Courses</span>
          <span className="text-5xl font-black text-indigo-900">{stats.courses}</span>
        </div>
`;

const newStats = `
        {/* Stat Cards */}
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><Shield className="w-4 h-4 mr-1" /> Total Admins</span>
          <span className="text-5xl font-black text-indigo-900">{stats.admins}</span>
        </div>
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> Total Students</span>
          <span className="text-5xl font-black text-indigo-900">{stats.students}</span>
        </div>
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><Users className="w-4 h-4 mr-1" /> Total Lecturers</span>
          <span className="text-5xl font-black text-indigo-900">{stats.lecturers}</span>
        </div>
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Active Courses</span>
          <span className="text-5xl font-black text-indigo-900">{stats.courses}</span>
        </div>
`;
code = code.replace(oldStats.trim(), newStats.trim());

const createLecturerStr = `
        {/* Create Lecturer Form */}
`;

const createAdminStr = `
        {/* Create Admin Form */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Create Admin</h2>
          
          {adminMessage.text && (
            <div className={\`mb-6 p-4 rounded-xl flex items-start \${adminMessage.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}\`}>
              {adminMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{adminMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. Admin Jane"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@uniben.edu"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Assign password"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-6"
            >
              <Shield className="w-5 h-5 mr-2" />
              {adminLoading ? 'Creating...' : 'Add Admin'}
            </button>
          </form>
        </div>

        {/* Admin Directory */}
        <div className="xl:col-span-8 bg-indigo-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Admin Directory</h2>
             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                {admins.length} ADMINS
             </span>
           </div>
           {admins.length > 0 ? (
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
              {admins.map((admin) => (
                <div key={admin.id} className="p-4 bg-white/10 border-2 border-white/10 rounded-2xl flex items-center justify-between hover:border-white/30 transition-colors">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-sm font-bold text-white">{admin.full_name}</p>
                    </div>
                    <p className="text-xs font-medium text-indigo-200">{admin.email}</p>
                  </div>
                  {profile?.id !== admin.id && (
                    <button 
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors"
                      title="Delete Admin"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-indigo-300 opacity-70">
              <Shield className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No admins found.</p>
            </div>
          )}
        </div>

        {/* Create Lecturer Form */}
`;

code = code.replace(createLecturerStr, createAdminStr);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
