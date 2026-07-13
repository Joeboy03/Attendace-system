import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, AttendanceSession, ClassSchedule } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { LogOut, QrCode, Users, PlusCircle, TrendingUp, Download, Calendar as CalendarIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Calendar from '../components/Calendar';
import AvatarUploader from '../components/AvatarUploader';
import { fetchSchedules } from '../lib/schedules';

export default function LecturerDashboard() {
  const { profile, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sessionStats, setSessionStats] = useState<any[]>([]);
  const [recentAttendees, setRecentAttendees] = useState<any[]>([]);
  const [demographicStats, setDemographicStats] = useState<{faculty: string, count: number}[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && selectedCourse) {
      interval = setInterval(() => {
        fetchRecentAttendees(selectedCourse);
        fetchSessionStats(selectedCourse);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, selectedCourse]);

  useEffect(() => {
    fetchCourses();
    if (profile?.id) {
      loadSchedules(profile.id);
    }
  }, [profile]);

  const loadSchedules = async (lecturerId: string) => {
    const data = await fetchSchedules({ lecturer_id: lecturerId });
    setSchedules(data);
  };

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
        fetchRecentAttendees(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAttendees = async (courseId: string) => {
    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError || !sessions || sessions.length === 0) {
        setRecentAttendees([]);
        return;
      }

      const sessionId = sessions[0].id;

      // Fetch all attendees for demographics
      const { data: allAttendees } = await supabase
        .from('attendance_records')
        .select(`
          users (
            faculty,
            department
          )
        `)
        .eq('session_id', sessionId);
        
      if (allAttendees) {
        const facultyCounts = allAttendees.reduce((acc: any, curr: any) => {
          const faculty = curr.users?.faculty || 'Unknown';
          acc[faculty] = (acc[faculty] || 0) + 1;
          return acc;
        }, {});
        
        setDemographicStats(Object.keys(facultyCounts).map(key => ({
          faculty: key,
          count: facultyCounts[key]
        })));
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          signed_at,
          users (
            full_name,
            matric_number,
            level,
            faculty,
            department
          )
        `)
        .eq('session_id', sessionId)
        .order('signed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentAttendees(data || []);
    } catch (error) {
      console.error('Error fetching recent attendees:', error);
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
      fetchRecentAttendees(selectedCourse);
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
      fetchRecentAttendees(selectedCourse);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleExport = async (formatType: 'csv' | 'pdf') => {
    if (!selectedCourse) return;
    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('id, created_at')
        .eq('course_id', selectedCourse)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError || !sessions || sessions.length === 0) {
        alert("No sessions found to export.");
        return;
      }

      const sessionId = sessions[0].id;
      const sessionDate = format(new Date(sessions[0].created_at), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          signed_at,
          users (
            full_name,
            matric_number,
            level,
            faculty,
            department
          )
        `)
        .eq('session_id', sessionId)
        .order('signed_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No attendance records found for the latest session.");
        return;
      }
      
      const course = courses.find(c => c.id === selectedCourse);
      const courseCode = course ? course.course_code : 'Course';

      if (formatType === 'csv') {
        const headers = ['Name', 'Matric Number', 'Level', 'Faculty', 'Department', 'Time Scanned', 'Status'];
        const csvContent = [
          headers.join(','),
          ...data.map((record: any) => [
            `"${record.users?.full_name || 'N/A'}"`,
            `"${record.users?.matric_number || 'N/A'}"`,
            `"${record.users?.level || 'N/A'}"`,
            `"${record.users?.faculty || 'N/A'}"`,
            `"${record.users?.department || 'N/A'}"`,
            `"${((record.signed_at && !isNaN(new Date(record.signed_at).getTime())) ? format(new Date(record.signed_at), 'h:mm:ss a') : 'N/A')}"`,
            '"PRESENT"'
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `${courseCode}_Attendance_${sessionDate}.csv`);
        a.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Attendance Report: ${courseCode}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Date: ${sessionDate}`, 14, 30);
        
        const tableColumn = ["Name", "Matric No.", "Level", "Dept", "Time", "Status"];
        const tableRows = data.map((record: any) => [
          record.users?.full_name || 'N/A',
          record.users?.matric_number || 'N/A',
          record.users?.level || 'N/A',
          record.users?.department || 'N/A',
          ((record.signed_at && !isNaN(new Date(record.signed_at).getTime())) ? format(new Date(record.signed_at), 'h:mm:ss a') : 'N/A'),
          'PRESENT'
        ]);
        
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
        });
        
        doc.save(`${courseCode}_Attendance_${sessionDate}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting records:', error);
      alert('Failed to export records.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Loading dashboard...</div>;

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
          <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Lecturer"} size="sm" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
            <p className="text-xs text-purple-600 font-medium">Lecturer</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-grow">
        
        {/* Manage Class / Active Session Control */}
        <div className="xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Manage Class
          </h2>
          <div className="space-y-4 flex-grow flex flex-col justify-center">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider text-xs">
                Select Course
              </label>
              <select
                className="w-full pl-4 pr-10 py-3 text-base border-2 border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 font-medium text-slate-800"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchActiveSession(e.target.value);
                  fetchSessionStats(e.target.value);
                  fetchRecentAttendees(e.target.value);
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
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors mt-4"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Start Session
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
        <div className="xl:col-span-1 bg-purple-900 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg min-h-[300px]">
          {activeSession ? (
            <>
              <div className="flex justify-between items-center w-full mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse mr-2"></span>
                  LIVE
                </span>
                <span className="text-purple-200 text-xs font-mono font-bold bg-black/20 px-3 py-1 rounded-full">Expires: {format(new Date(activeSession.expires_at), 'h:mm a')}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl mb-4 shadow-xl">
                <div className="border-4 border-slate-900 flex items-center justify-center rounded-xl overflow-hidden p-2">
                  <QRCodeSVG 
                    value={JSON.stringify({ 
                      sessionId: activeSession.id, 
                      token: activeSession.session_token 
                    })} 
                    size={180}
                    level="H"
                  />
                </div>
              </div>
              <p className="text-white font-mono text-sm font-bold truncate max-w-full px-4">{activeSession.session_token.split('-')[0].toUpperCase()}</p>
            </>
          ) : (
            <div className="text-purple-300 flex flex-col items-center opacity-70">
              <QrCode className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold text-white">No Active Session</p>
            </div>
          )}
        </div>

        {/* Attendance Trends */}
        <div className="xl:col-span-2 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
              Attendance Trends
            </h2>
            {selectedCourse && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {courses.find(c => c.id === selectedCourse)?.course_code}
              </span>
            )}
          </div>
          
          <div className="flex-grow w-full min-h-[200px]">
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

        {/* Faculty Demographics */}
        <div className="xl:col-span-1 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              Faculty Breakdown
            </h2>
          </div>
          <div className="flex-grow flex flex-col justify-center space-y-4">
            {demographicStats.length > 0 ? (
              demographicStats.sort((a, b) => b.count - a.count).map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span className="truncate max-w-[150px]">{stat.faculty}</span>
                    <span>{stat.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full" 
                      style={{ width: `${(stat.count / Math.max(...demographicStats.map(s => s.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 font-medium text-sm">
                No demographics.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Log */}
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 overflow-hidden flex flex-col shadow-sm min-h-[250px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                Class Participation Log
              </h3>
              {activeSession && <span className="animate-pulse w-2.5 h-2.5 bg-green-500 rounded-full ml-3"></span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('csv')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm">
                <Download className="w-3 h-3 mr-1" /> CSV
              </button>
              <button onClick={() => handleExport('pdf')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm">
                <Download className="w-3 h-3 mr-1" /> PDF
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student Name</th>
                  <th className="p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Matric Number</th>
                  <th className="p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level & Dept</th>
                  <th className="p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Time Scanned</th>
                  <th className="p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendees.length > 0 ? (
                  recentAttendees.map((record, i) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                          {record.users?.full_name?.charAt(0) || '?'}
                        </div>
                        {record.users?.full_name || 'Unknown'}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600">{record.users?.matric_number || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{record.users?.department || 'N/A'}</span>
                          <span className="text-[10px] font-medium text-slate-500">{record.users?.level || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">{((record.signed_at && !isNaN(new Date(record.signed_at).getTime())) ? format(new Date(record.signed_at), 'h:mm:ss a') : 'N/A')}</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">PRESENT</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium text-sm">
                      No recent attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="mt-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">My Class Schedule</h2>
        <Calendar schedules={schedules} />
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

