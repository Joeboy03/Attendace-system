import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Shield, Users, BookOpen, PlusCircle, GraduationCap, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0 });
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: lecturerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'lecturer');
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      
      setStats({
        students: studentCount || 0,
        lecturers: lecturerCount || 0,
        courses: courseCount || 0
      });

      // Fetch lecturers for the dropdown
      const { data: lecturerData } = await supabase.from('users').select('id, full_name').eq('role', 'lecturer');
      if (lecturerData) setLecturers(lecturerData);

      // Fetch courses
      const { data: courseData } = await supabase.from('courses').select('*, lecturer:lecturer_id(full_name)').order('created_at', { ascending: false });
      if (courseData) setCourses(courseData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 flex flex-col">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold text-xl">U</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900">University of Benin</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attendance Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
            <p className="text-xs text-indigo-600 font-medium flex items-center justify-end"><Shield className="w-3 h-3 mr-1" /> Administrator</p>
          </div>
          <button 
            onClick={signOut}
            className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 hover:bg-indigo-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 flex-grow">
        
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
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors uppercase"
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
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assign Lecturer</label>
              <select
                required
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"
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
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-6"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {loading ? 'Creating...' : 'Add Course'}
            </button>
          </form>
        </div>

        {/* Course List */}
        <div className="xl:col-span-8 bg-indigo-900 rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Course Directory</h2>
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
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-black rounded-md">{course.course_code}</span>
                      <p className="text-sm font-bold text-white">{course.course_title}</p>
                    </div>
                    <p className="text-xs font-medium text-indigo-200 flex items-center mt-2">
                      <Users className="w-3 h-3 mr-1" />
                      {course.lecturer?.full_name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-indigo-300 opacity-70">
              <BookOpen className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold text-center">No courses have been created yet.</p>
            </div>
          )}
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

