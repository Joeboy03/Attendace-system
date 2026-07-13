import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Shield, Users, UserPlus, BookOpen, PlusCircle, GraduationCap, CheckCircle, XCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Calendar from '../components/Calendar';
import AdminSearch from '../components/AdminSearch';
import AdminDepartments from '../components/AdminDepartments';
import AvatarUploader from '../components/AvatarUploader';
import { ClassSchedule } from '../types';
import { fetchSchedules, createSchedule } from '../lib/schedules';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  
  // Admin State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });

  // Lecturer State
  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('');
  const [newLecturerStaffId, setNewLecturerStaffId] = useState('');
  const [lecturerLoading, setLecturerLoading] = useState(false);
  const [lecturerMessage, setLecturerMessage] = useState({ type: '', text: '' });

  const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0, admins: 0 });
  const [admins, setAdmins] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Schedule state
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [scheduleCourseId, setScheduleCourseId] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    const data = await fetchSchedules();
    setSchedules(data);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { count: adminCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');
      const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: lecturerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'lecturer');
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      
      setStats({
        admins: adminCount || 0,
        students: studentCount || 0,
        lecturers: lecturerCount || 0,
        courses: courseCount || 0
      });

      // Fetch admins
      const { data: adminData } = await supabase.from('users').select('*').eq('role', 'admin');
      if (adminData) setAdmins(adminData);

      // Fetch lecturers for the dropdown
      const { data: lecturerData } = await supabase.from('users').select('*').eq('role', 'lecturer');
      if (lecturerData) setLecturers(lecturerData);

      const { data: studentData } = await supabase.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false }).limit(100);
      if (studentData) setStudents(studentData);

      // Fetch courses
      const { data: courseData } = await supabase.from('courses').select('*, lecturer:lecturer_id(full_name)').order('created_at', { ascending: false });
      if (courseData) setCourses(courseData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage({ type: '', text: '' });
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: newAdminName,
          email: newAdminEmail,
          role: 'admin',
        });

        if (dbError) throw dbError;
        
        setAdminMessage({ type: 'success', text: 'Admin created successfully! Note: You may have been logged out due to client-side auth limits.' });
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchDashboardData();
      }
    } catch (error: any) {
      setAdminMessage({ type: 'error', text: error.message || 'Failed to create admin.' });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateLecturer = async (e: React.FormEvent) => {

    e.preventDefault();
    setLecturerLoading(true);
    setLecturerMessage({ type: '', text: '' });
    
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newLecturerEmail,
        password: newLecturerPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add to users table
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: newLecturerName,
          email: newLecturerEmail,
          role: 'lecturer',
          staff_id: newLecturerStaffId,
        });

        if (dbError) throw dbError;
        
        setLecturerMessage({ type: 'success', text: 'Lecturer created successfully! Note: You may have been logged out due to client-side auth limits.' });
        setNewLecturerName('');
        setNewLecturerEmail('');
        setNewLecturerPassword('');
        setNewLecturerStaffId('');
        fetchDashboardData();
      }
    } catch (error: any) {
      setLecturerMessage({ type: 'error', text: error.message || 'Failed to create lecturer.' });
    } finally {
      setLecturerLoading(false);
    }
  };



  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete admin');
    }
  };

  
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

  const handleCreateCourse = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.from('courses').insert({
        course_code: newCourseCode.toUpperCase(),
        course_title: newCourseTitle,
        lecturer_id: selectedLecturer || null
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Course created successfully!' });
      setNewCourseCode('');
      setNewCourseTitle('');
      setSelectedLecturer('');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create course.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleLoading(true);
    setScheduleMessage({ type: '', text: '' });

    try {
      const selectedCourse = courses.find(c => c.id === scheduleCourseId);
      if (!selectedCourse) throw new Error("Invalid course selected");

      const startTime = new Date(`${scheduleDate}T${scheduleStartTime}`).toISOString();
      const endTime = new Date(`${scheduleDate}T${scheduleEndTime}`).toISOString();

      await createSchedule({
        course_id: selectedCourse.id,
        lecturer_id: selectedCourse.lecturer_id,
        title: scheduleTitle || selectedCourse.course_code,
        start_time: startTime,
        end_time: endTime,
        location: scheduleLocation,
      });

      setScheduleMessage({ type: 'success', text: 'Class scheduled successfully!' });
      setScheduleCourseId('');
      setScheduleTitle('');
      setScheduleDate('');
      setScheduleStartTime('');
      setScheduleEndTime('');
      setScheduleLocation('');
      loadSchedules();
    } catch (error: any) {
      setScheduleMessage({ type: 'error', text: error.message || 'Failed to schedule class.' });
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-purple-900/5 border border-white/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform">U</div>
          <div>
            <h1 className="text-2xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900">University of Benin</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attendance Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Admin"} size="sm" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
            <p className="text-xs text-purple-600 font-medium flex items-center justify-end"><Shield className="w-3 h-3 mr-1" /> Administrator</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 flex-grow">
        
        {/* Stat Cards */}
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><Shield className="w-4 h-4 mr-1" /> Total Admins</span>
          <span className="text-5xl font-[Space_Grotesk] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700">{stats.admins}</span>
        </div>
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><GraduationCap className="w-4 h-4 mr-1" /> Total Students</span>
          <span className="text-5xl font-[Space_Grotesk] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700">{stats.students}</span>
        </div>
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><Users className="w-4 h-4 mr-1" /> Total Lecturers</span>
          <span className="text-5xl font-[Space_Grotesk] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700">{stats.lecturers}</span>
        </div>
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 p-6 flex flex-col items-center justify-center shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Active Courses</span>
          <span className="text-5xl font-[Space_Grotesk] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700">{stats.courses}</span>
        </div>
        
        {/* Unified Search Section */}
        <div className="xl:col-span-12">
          <AdminSearch />
        </div>
        
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


        {/* Department Management Section */}
        <div className="xl:col-span-12">
          <AdminDepartments />
        </div>
        
        
        {/* Create Admin Form */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Create Admin</h2>
          
          {adminMessage.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${adminMessage.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`}>
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
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
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
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
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
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-6"
            >
              <Shield className="w-5 h-5 mr-2" />
              {adminLoading ? 'Creating...' : 'Add Admin'}
            </button>
          </form>
        </div>

        {/* Admin Directory */}
        <div className="xl:col-span-8 bg-purple-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-purple-100 uppercase tracking-widest">Admin Directory</h2>
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
                    <p className="text-xs font-medium text-purple-200">{admin.email}</p>
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
            <div className="flex-grow flex flex-col items-center justify-center text-purple-300 opacity-70">
              <Shield className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No admins found.</p>
            </div>
          )}
        </div>

        {/* Create Lecturer Form */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Create Lecturer</h2>
          
          {lecturerMessage.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${lecturerMessage.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`}>
              {lecturerMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{lecturerMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateLecturer} className="space-y-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={newLecturerName}
                onChange={(e) => setNewLecturerName(e.target.value)}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Staff ID</label>
              <input
                type="text"
                required
                value={newLecturerStaffId}
                onChange={(e) => setNewLecturerStaffId(e.target.value)}
                placeholder="e.g. L-12345"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={newLecturerEmail}
                onChange={(e) => setNewLecturerEmail(e.target.value)}
                placeholder="lecturer@uniben.edu"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={newLecturerPassword}
                onChange={(e) => setNewLecturerPassword(e.target.value)}
                placeholder="Assign password"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={lecturerLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-6"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {lecturerLoading ? 'Creating...' : 'Add Lecturer'}
            </button>
          </form>
        </div>


        {/* Lecturer Directory */}
        <div className="xl:col-span-8 bg-purple-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-purple-100 uppercase tracking-widest">Lecturer Directory</h2>
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
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-black rounded-md">{lecturer.staff_id || 'NO ID'}</span>
                      <p className="text-sm font-bold text-white">{lecturer.full_name}</p>
                    </div>
                    <p className="text-xs font-medium text-purple-200">{lecturer.email}</p>
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
            <div className="flex-grow flex flex-col items-center justify-center text-purple-300 opacity-70">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No lecturers have been created yet.</p>
            </div>
          )}
        </div>

        {/* Create Course Form */}

        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Create New Course</h2>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${message.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateCourse} className="space-y-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Course Code</label>
              <input
                type="text"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CSC411"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Course Title</label>
              <input
                type="text"
                required
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="e.g. Software Engineering"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assign Lecturer</label>
              <select
                required
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"
              >
                <option value="" disabled>Select a Lecturer...</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-6"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Add Course'}
            </button>
          </form>
        </div>

        {/* Course List */}
        <div className="xl:col-span-8 bg-purple-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-purple-100 uppercase tracking-widest">Course Directory</h2>
             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                {courses.length} REGISTERED
             </span>
           </div>

           {courses.length > 0 ? (
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
              {courses.map((course) => (
                <div key={course.id} className="p-4 bg-white/10 border-2 border-white/10 rounded-2xl flex items-center justify-between hover:border-white/30 transition-colors">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-black rounded-md">{course.course_code}</span>
                      <p className="text-sm font-bold text-white">{course.course_title}</p>
                    </div>
                    <p className="text-xs font-medium text-purple-200 flex items-center mt-2">
                      <Users className="w-3 h-3 mr-1" />
                      {course.lecturer?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors flex-shrink-0"
                    title="Delete Course"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-purple-300 opacity-70">
              <BookOpen className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No courses have been created yet.</p>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4">
        {/* Schedule Class Form */}
        <div className="xl:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Schedule Class</h2>
          
          {scheduleMessage.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${scheduleMessage.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`}>
              {scheduleMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{scheduleMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleCreateSchedule} className="space-y-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Course</label>
              <select
                required
                value={scheduleCourseId}
                onChange={(e) => setScheduleCourseId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"
              >
                <option value="" disabled>Select a Course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Time</label>
                <input
                  type="time"
                  required
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">End Time</label>
                <input
                  type="time"
                  required
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location (Optional)</label>
              <input
                type="text"
                value={scheduleLocation}
                onChange={(e) => setScheduleLocation(e.target.value)}
                placeholder="e.g. Hall 2"
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={scheduleLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-6"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              {scheduleLoading ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </form>
        </div>

        {/* Calendar View */}
        <div className="xl:col-span-8">
          <Calendar schedules={schedules} />
        </div>
      </div>

      <footer className="mt-6 flex justify-between items-center text-[11px] text-slate-400 uppercase font-bold tracking-wider">
        <p>© 2024 University of Benin • CSC Final Year Project</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> System Online</span>
        </div>
      </footer>
    </div>
  );
}

