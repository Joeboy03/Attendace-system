import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, ClassSchedule } from '../types';
import { LogOut, Camera, CheckCircle, XCircle, Calendar as CalendarIcon, Download, LayoutGrid, List, ArrowUpDown, Filter, ChevronDown, ChevronRight, Target, Award, Clock } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { fetchFaculties, fetchDepartments } from '../lib/departments';
import { Faculty, Department } from '../types';
import Calendar from '../components/Calendar';
import { fetchSchedules } from '../lib/schedules';

export default function StudentDashboard() {

  const { profile, signOut, refreshProfile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    matric_number: profile?.matric_number || '',
    level: profile?.level || '100',
    faculty: profile?.faculty || '',
    department: profile?.department || ''
  });
  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);

  useEffect(() => {
    fetchFaculties().then(setFacultiesList);
  }, []);

  useEffect(() => {
    if (profileForm.faculty) {
      const f = facultiesList.find(fac => fac.name === profileForm.faculty);
      if (f) {
        fetchDepartments(f.id).then(setDepartmentsList);
      } else {
        setDepartmentsList([]);
      }
    } else {
      setDepartmentsList([]);
    }
  }, [profileForm.faculty, facultiesList]);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        matric_number: profile.matric_number || '',
        level: profile.level || '100',
        faculty: profile.faculty || '',
        department: profile.department || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchEnrollments();
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateMsg(null);
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          matric_number: profileForm.matric_number,
          level: profileForm.level,
          faculty: profileForm.faculty,
          department: profileForm.department
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await refreshProfile();
      setTimeout(() => setIsEditingProfile(false), 1500);
    } catch (error: any) {
      setProfileUpdateMsg({ type: 'error', text: error.message || 'Failed to update profile' });
      console.error('Error updating profile:', error);
    }
  };

  const fetchEnrollments = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          courses (
            id,
            course_code,
            course_title
          )
        `)
        .eq('student_id', profile.id);
        
      if (error) throw error;
      setEnrolledCourses(data || []);
      
      if (data && data.length > 0) {
        const courseIds = data.map(e => e.course_id);
        const scheduleData = await fetchSchedules({ course_ids: courseIds });
        setSchedules(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render(onScanSuccess, onScanFailure);
      
      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanning]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
      if (!profile?.matric_number) {
        setScanning(false);
        setIsEditingProfile(true);
        return;
      }

      // Expecting JSON: { sessionId: "...", token: "..." }
      const data = JSON.parse(decodedText);
      if (!data.sessionId || !data.token) throw new Error("Invalid QR Code format");
      
      // Stop scanner immediately
      setScanning(false);
      setScanResult(null);
      
      // Verify session and mark attendance
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', data.sessionId)
        .eq('session_token', data.token)
        .eq('is_active', true)
        .single();
        
      if (sessionError || !session) {
        throw new Error("Invalid or expired session");
      }
      
      // Check if already signed in
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', session.id)
        .eq('student_id', profile?.id)
        .maybeSingle();
        
      if (existingRecord) {
        return;
      }
      
      // Mark attendance
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          session_id: session.id,
          student_id: profile?.id
        });
        if (insertError) throw insertError;
      
      
    } catch (error: any) {
      console.error("Scan error:", error);
      setScanning(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Usually ignoring regular scan failures since it scans constantly
  };



  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!profile) return;
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            id,
            signed_at,
            attendance_sessions (
              id,
              courses (
                course_code,
                course_title
              )
            )
          `)
          .eq('student_id', profile.id)
          .order('signed_at', { ascending: false });
        
        if (error) throw error;
        setAttendanceHistory(data || []);
      } catch (err) {
        console.error('Error fetching attendance history:', err);
      }
    };
    fetchAttendanceHistory();
  }, [profile]);
  return (
    <div className="min-h-screen bg-[#18191B] text-slate-300 font-sans p-6 flex flex-col gap-6">
      
      {/* Top Section - Student Profile */}
      <div className="bg-[#232427] rounded-3xl p-8 border border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#60D8B6] rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Student Profile</h2>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors text-white">
              This Year <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button 
              onClick={() => setScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#60D8B6] text-slate-900 rounded-xl text-sm font-bold hover:bg-[#4bc2a0] transition-colors"
            >
              <Camera className="w-4 h-4" /> Scan QR Code
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">{profile?.full_name || 'Student Name'}</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Matric Number</p>
                  <p className="text-sm font-medium text-white">{profile?.matric_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Level / Department</p>
                  <p className="text-sm font-medium text-white">{profile?.level} • {profile?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-white">{profile?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#2D2E32] rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{attendanceHistory.length}</p>
              <p className="text-xs text-slate-400">Total Classes Attended</p>
            </div>
          </div>
          
          <div className="bg-[#2D2E32] rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{enrolledCourses.length}</p>
              <p className="text-xs text-slate-400">Enrolled Courses</p>
            </div>
          </div>
          
          <div className="bg-[#2D2E32] rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{schedules.length}</p>
              <p className="text-xs text-slate-400">Upcoming Classes</p>
            </div>
          </div>
          
          <div className="bg-[#2D2E32] rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Active</p>
              <p className="text-xs text-slate-400">Student Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal / Section */}
      {scanning && (
        <div className="bg-[#232427] rounded-3xl p-8 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#60D8B6] rounded-full"></div>
               <h2 className="text-xl font-bold text-white">Scan Class QR Code</h2>
             </div>
             <button onClick={() => setScanning(false)} className="text-slate-400 hover:text-white">
               <XCircle className="w-6 h-6" />
             </button>
          </div>
          
          {scanResult && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${scanResult.status === 'success' ? 'bg-[#60D8B6]/20 text-[#60D8B6] border border-[#60D8B6]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {scanResult.status === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{scanResult.message}</p>
            </div>
          )}

          <div className="bg-[#18191B] p-4 rounded-2xl border border-slate-800 mx-auto max-w-md">
            <div id="reader" className="w-full rounded-xl overflow-hidden [&>div]:border-none [&_video]:rounded-xl text-slate-300"></div>
          </div>
        </div>
      )}

      {/* Bottom Section - Attendance History */}
      <div className="bg-[#232427] rounded-3xl p-8 border border-slate-800 flex-grow">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#60D8B6] rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Attendance History</h2>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-[#18191B] p-1 rounded-xl border border-slate-800">
              <button className="p-2 rounded-lg bg-[#2D2E32] text-white">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-slate-500 hover:text-white">
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors text-white">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors text-white">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendanceHistory.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-500">
               No attendance records found.
             </div>
          ) : (
            attendanceHistory.map(record => {
              const date = new Date(record.signed_at);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
              const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              
              // We'll just assume "On Time" for now since we don't have the class start time readily available in this loop without joining differently, but we can simulate it or just use "On Time".
              const status = "On Time";
              
              return (
                <div key={record.id} className="bg-[#2D2E32] rounded-2xl p-5 border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {formattedDate}
                    </div>
                    <span className="px-3 py-1 bg-[#60D8B6]/10 text-[#60D8B6] text-xs font-bold rounded-full">
                      {status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Course Code</p>
                      <p className="text-sm font-bold text-white">{record.attendance_sessions?.courses?.course_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Check In Time</p>
                      <p className="text-sm font-bold text-white">{formattedTime}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination placeholder */}
        {attendanceHistory.length > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            {[1, 2, 3, 4, '...', 8, 9, 10].map((page, idx) => (
              <button 
                key={idx} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${page === 1 ? 'border border-slate-600 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
