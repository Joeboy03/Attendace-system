const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, AttendanceSession, ClassSchedule } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  LayoutGrid, 
  TrendingUp, 
  Briefcase, 
  FileText, 
  Wallet, 
  Clock, 
  Percent, 
  Settings, 
  ArrowUpRight, 
  ArrowDownRight,
  Wifi,
  MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function LecturerDashboard() {
  const { profile, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sessionStats, setSessionStats] = useState<any[]>([]);
  const [recentAttendees, setRecentAttendees] = useState<any[]>([]);

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
      const { data, error } = await supabase
        .from('attendance_records')
        .select(\`
          id,
          scanned_at,
          users (
            full_name,
            matric_number,
            department
          )
        \`)
        .eq('session_id', sessionId)
        .order('scanned_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setRecentAttendees(data || []);
    } catch (error) {
      console.error('Error fetching recent attendees:', error);
    }
  };

  const fetchSessionStats = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('id, created_at, attendance_records(count)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
        .limit(12);

      if (error) throw error;
      
      const formattedStats = data.map((session: any) => ({
        name: format(new Date(session.created_at), 'MMM dd'),
        attendance: session.attendance_records[0]?.count || 0
      }));
      
      setSessionStats(formattedStats);
    } catch (error) {
      console.error('Error fetching session stats:', error);
    }
  };

  const fetchActiveSession = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setActiveSession(data || null);
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedCourse || !profile) return;
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      
      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          course_id: selectedCourse,
          lecturer_id: profile.id,
          session_token: crypto.randomUUID(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      setActiveSession(data);
      fetchSessionStats(selectedCourse);
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
      fetchSessionStats(selectedCourse);
      fetchRecentAttendees(selectedCourse);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getFirstName = () => {
    if (!profile?.full_name) return 'User';
    return profile.full_name.split(' ')[0];
  };

  const activeCourseData = courses.find(c => c.id === selectedCourse);
  
  // Dummy data for charts to match design if real data is sparse
  const barData = [
    { name: 'JAN', value: 20 },
    { name: 'FEB', value: 45 },
    { name: 'MAR', value: 30 },
    { name: 'APR', value: 65, active: true },
    { name: 'MAY', value: 40 },
    { name: 'JUN', value: 50 },
  ];

  const lineData = [
    { name: '1', value: 20 },
    { name: '2', value: 30 },
    { name: '3', value: 25 },
    { name: '4', value: 40 },
    { name: '5', value: 35 },
    { name: '6', value: 50 },
    { name: '7', value: 45 },
    { name: '8', value: 60 },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 font-sans p-4 md:p-8 flex">
      {/* Container */}
      <div className="w-full max-w-[1400px] mx-auto bg-[#F6F8FA] rounded-[32px] md:rounded-[40px] shadow-sm flex overflow-hidden border-4 border-white">
        
        {/* Floating Sidebar */}
        <div className="w-20 bg-[#F6F8FA] flex flex-col items-center py-8 justify-between relative z-10 border-r border-slate-200/50">
          <div className="space-y-6 flex flex-col items-center">
            {/* Logo Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#1C7A58] to-[#12583F] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#1C7A58]/20">
              U
            </div>
            
            {/* Nav Icons */}
            <div className="w-12 h-12 bg-[#1C7A58] rounded-full flex items-center justify-center text-white shadow-md shadow-[#1C7A58]/30">
              <LayoutGrid size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <Percent size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors cursor-pointer">
              <Settings size={20} strokeWidth={2.5} />
            </div>
            <div 
              onClick={signOut}
              className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200/50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full bg-[#F6F8FA] overflow-y-auto">
          
          {/* Header */}
          <header className="flex justify-between items-center px-8 py-6">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                <span className="text-[#1C7A58] mr-1">Quix</span>otic
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1 bg-white rounded-full px-2 py-1.5 shadow-sm border border-slate-100">
              <button className="px-6 py-2 bg-slate-50 text-slate-800 rounded-full text-sm font-semibold shadow-sm border border-slate-200/50">Dashboard</button>
              <button className="px-6 py-2 text-slate-500 hover:text-slate-700 rounded-full text-sm font-medium transition-colors">Reports</button>
              <button className="px-6 py-2 text-slate-500 hover:text-slate-700 rounded-full text-sm font-medium transition-colors">Documents</button>
              <button className="px-6 py-2 text-slate-500 hover:text-slate-700 rounded-full text-sm font-medium transition-colors">History</button>
              <button className="px-6 py-2 text-slate-500 hover:text-slate-700 rounded-full text-sm font-medium transition-colors">Contacts</button>
            </div>

            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50">
                <Search size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 bg-white rounded-full p-1.5 pr-3 shadow-sm border border-slate-100 cursor-pointer">
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                  <img src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${profile?.full_name || 'user'}\`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </div>
            </div>
          </header>

          {/* Welcome & Date Row */}
          <div className="px-8 flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <h1 className="text-[32px] text-slate-800 tracking-tight">
              Welcome Back, <span className="font-bold">{getFirstName()}</span>
            </h1>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200/70 shadow-sm text-sm font-medium text-slate-600">
                <CalendarIcon size={16} className="text-slate-400" />
                <span>29 Jun, 2025 - 29 August, 2025</span>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </div>
              
              <select 
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  fetchActiveSession(e.target.value);
                  fetchSessionStats(e.target.value);
                  fetchRecentAttendees(e.target.value);
                }}
                className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/70 shadow-sm text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1C7A58]"
              >
                {courses.length > 0 ? (
                   courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)
                ) : (
                   <option disabled>No Courses</option>
                )}
              </select>

              {!activeSession ? (
                <button 
                  onClick={handleStartSession}
                  disabled={!selectedCourse}
                  className="bg-white hover:bg-slate-50 border border-slate-200/70 shadow-sm text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Session
                </button>
              ) : (
                <button 
                  onClick={handleEndSession}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-colors"
                >
                  End Session
                </button>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="px-8 pb-8 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* Left Column (Card style + Weekly Revenue) */}
              <div className="lg:col-span-3 space-y-6 flex flex-col">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-slate-800 font-bold text-base">Active Course</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Course overview details</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                  
                  {/* The Green Card */}
                  <div className="bg-gradient-to-br from-[#1C7A58] to-[#12583F] rounded-2xl p-5 text-white shadow-lg shadow-[#1C7A58]/20 relative overflow-hidden">
                    {/* Decorative pattern could go here */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <span className="font-bold text-lg tracking-wider">UNIBEN</span>
                      <Wifi size={18} className="rotate-90 opacity-80" />
                    </div>
                    
                    <div className="mb-8 relative z-10">
                      <p className="text-white/70 text-xs mb-1">Course Code</p>
                      <h2 className="text-[28px] font-bold leading-none">{activeCourseData?.course_code || '---'}</h2>
                    </div>
                    
                    <div className="flex justify-between items-end relative z-10 text-xs font-medium text-white/80">
                      <span className="tracking-widest">**** {activeCourseData?.id?.substring(0, 4) || '0000'}</span>
                      <span>EXP 09/26</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-500 text-xs font-medium">Weekly Attendance</p>
                    <div className="bg-[#E2F1EB] text-[#1C7A58] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center">
                      +12.8%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">+3,945 <span className="text-base text-slate-400 font-medium">Students</span></h3>
                </div>
              </div>

              {/* Middle Column (Bar Chart) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                      <LayoutGrid size={14} />
                    </div>
                    <h3 className="text-slate-800 font-bold text-base">Engagement Rate</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-1 rounded-full flex text-xs font-semibold border border-slate-100">
                      <button className="px-4 py-1.5 rounded-full text-slate-500 hover:text-slate-700">Monthly</button>
                      <button className="px-4 py-1.5 rounded-full bg-[#1C7A58] text-white shadow-sm">Annually</button>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                        tickFormatter={(val) => \`\${val}k\`}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={40}>
                        {barData.map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={entry.active ? '#1C7A58' : '#88BEA8'} style={{ opacity: entry.active ? 1 : 0.8 }} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Custom tooltip marker simulation */}
                  <div className="absolute top-[8%] left-[55%] -translate-x-1/2 bg-[#1C7A58] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 flex items-center">
                    +17.8%
                  </div>
                  <div className="absolute top-[16%] left-[55%] -translate-x-1/2 w-3 h-3 bg-white border-[3px] border-[#1C7A58] rounded-full z-10 shadow-sm"></div>
                </div>
              </div>

              {/* Right Column (Line Chart & Amount Credit) */}
              <div className="lg:col-span-4 space-y-6 flex flex-col">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden h-[240px] flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-slate-800 font-bold text-base">Attendance Goal</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Total class attendance goal</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors z-10">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                  
                  <div className="text-center mt-2 mb-4 z-10">
                    <p className="text-slate-500 text-xs font-medium">Total Balance</p>
                    <h3 className="text-[28px] font-bold text-slate-800">$32,678.90</h3>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1C7A58" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#1C7A58" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1C7A58" 
                          strokeWidth={2}
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-10">
                    <button className="flex-1 bg-[#1C7A58] text-white py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1 shadow-sm shadow-[#1C7A58]/20">
                      Send <ArrowUpRight size={14} />
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1 shadow-sm hover:bg-slate-50">
                      Receive <ArrowDownRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                          <Wallet size={16} />
                        </div>
                        <div>
                          <h3 className="text-slate-800 font-bold text-base">Amount of credit</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Total refund amount with fee</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end gap-3 mb-6">
                      <h3 className="text-4xl font-bold text-slate-800">$8,945<span className="text-2xl text-slate-400">.89</span></h3>
                      <div className="bg-[#1C7A58] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                        +12.8%
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                    <button className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">
                      <ArrowUpRight size={12} />
                    </button>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Mandatory Payments</h4>
                    <p className="text-slate-400 text-xs mb-4">Recent payments</p>
                    
                    <div className="flex items-center">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 relative z-40" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-30" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-20" />
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 -ml-3 relative z-10" />
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#1C7A58] text-white text-xs font-bold flex items-center justify-center -ml-3 relative z-0 shadow-sm">
                        +2
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Table */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-slate-800 font-bold text-base">Session History</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Recent attendance history</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendees.length > 0 ? (
                        recentAttendees.map((record, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#FFE7D9] flex items-center justify-center text-[#FF5630] font-bold text-xs">
                                  {record.users?.full_name?.substring(0, 2).toUpperCase() || 'UN'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{record.users?.full_name}</p>
                                  <p className="text-xs text-slate-400">{record.users?.matric_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-sm font-semibold text-slate-700">
                              {format(new Date(record.scanned_at), 'dd MMM yyyy')}
                            </td>
                            <td className="py-4 text-sm font-semibold text-slate-700">
                              {format(new Date(record.scanned_at), 'hh:mm a')}
                            </td>
                            <td className="py-4">
                              <span className="flex items-center text-xs font-bold text-[#1C7A58]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1C7A58] mr-2"></span>
                                Present
                              </span>
                            </td>
                            <td className="py-4 text-sm font-semibold text-slate-700 text-right">
                              {record.users?.department || 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                            No recent attendees
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CalendarIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
`

fs.writeFileSync('src/pages/LecturerDashboard.tsx', code);
