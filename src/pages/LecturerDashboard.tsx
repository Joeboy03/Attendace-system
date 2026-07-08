import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, AttendanceSession } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { LogOut, QrCode, Users, PlusCircle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function LecturerDashboard() {
  const { profile, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sessionStats, setSessionStats] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  const fetchCourses = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('lecturer_id', profile.id);
      
      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
        fetchActiveSession(data[0].id);
        fetchSessionStats(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSession = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      setActiveSession(data || null);
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const fetchSessionStats = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select(`
          id, 
          created_at, 
          attendance_records(count)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      const formattedStats = data?.map((session, index) => {
        // Handle postgrest count return which is an array of objects for related tables
        let count = 0;
        if (session.attendance_records && session.attendance_records.length > 0) {
           count = (session.attendance_records[0] as any).count || session.attendance_records.length;
        }
        
        return {
          name: `S${index + 1}`,
          date: format(new Date(session.created_at), 'MMM d'),
          attendance: count
        };
      }) || [];
      
      setSessionStats(formattedStats);
    } catch (error) {
      console.error('Error fetching session stats:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedCourse || !profile) return;
    
    // Generate a secure random token for the QR code
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          course_id: selectedCourse,
          lecturer_id: profile.id,
          session_token: sessionToken,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      setActiveSession(data);
      fetchSessionStats(selectedCourse); // Refresh stats
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const { error } = await supabase
        .from('attendance_sessions')
        .update({ is_active: false })
        .eq('id', activeSession.id);
        
      if (error) throw error;
      setActiveSession(null);
      fetchSessionStats(selectedCourse); // Refresh stats
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Loading dashboard...</div>;

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
            <p className="text-xs text-indigo-600 font-medium">Lecturer</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-grow">
        
        {/* Manage Class / Active Session Control */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Manage Class
          </h2>
          <div className="space-y-4 flex-grow flex flex-col justify-center">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">
                Select Course
              </label>
              <select
                className="w-full pl-4 pr-10 py-3 text-base border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 font-medium text-slate-800"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchActiveSession(e.target.value);
                }}
                disabled={activeSession !== null}
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_title}
                  </option>
                ))}
              </select>
            </div>
            
            {!activeSession ? (
              <button
                onClick={handleStartSession}
                disabled={!selectedCourse}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-4"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Start Attendance Session
              </button>
            ) : (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleEndSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-4 rounded-xl text-sm font-bold flex-1 transition-colors flex items-center justify-center"
                >
                  End Active Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="lg:col-span-2 bg-indigo-900 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg min-h-[400px]">
          {activeSession ? (
            <>
              <div className="flex justify-between items-center w-full mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse mr-2"></span>
                  LIVE
                </span>
                <span className="text-indigo-200 text-xs font-mono font-bold bg-black/20 px-3 py-1 rounded-full">Expires: {format(new Date(activeSession.expires_at), 'h:mm a')}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl mb-4 shadow-xl">
                <div className="border-4 border-slate-900 flex items-center justify-center rounded-xl overflow-hidden p-2">
                  <QRCodeSVG 
                    value={JSON.stringify({ 
                      sessionId: activeSession.id, 
                      token: activeSession.session_token 
                    })} 
                    size={220}
                    level="H"
                  />
                </div>
              </div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-2">Session Token</p>
              <p className="text-white font-mono text-lg font-bold truncate max-w-full px-4">{activeSession.session_token.split('-')[0].toUpperCase()}</p>
            </>
          ) : (
            <div className="text-indigo-300 flex flex-col items-center opacity-70">
              <QrCode className="w-20 h-20 mb-4" />
              <p className="text-xl font-bold text-white">No Active Session</p>
              <p className="text-sm mt-2 text-center text-indigo-200 font-medium">Select a course and start a session<br/>to display the QR code.</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="mt-4 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
            Attendance Trends
          </h2>
          {selectedCourse && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {courses.find(c => c.id === selectedCourse)?.course_code}
            </span>
          )}
        </div>
        
        <div className="h-64 w-full">
          {sessionStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4338ca" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#312e81', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  name="Students Present"
                  stroke="#4338ca" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAttendance)" 
                  activeDot={{ r: 6, fill: '#4338ca', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl">
              No attendance data available for this course yet.
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

