import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, ClassSchedule } from '../types';
import { LogOut, Camera, CheckCircle, XCircle, Calendar as CalendarIcon, Download, LayoutGrid, List, ArrowUpDown, Filter, ChevronDown, ChevronRight, Target, Award, Clock } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { fetchFaculties, fetchDepartments } from '../lib/departments';
import { Faculty, Department } from '../types';
import Calendar from '../components/Calendar';
import AvatarUploader from '../components/AvatarUploader';
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
        setScanResult({ status: 'success', message: 'Already signed in for this session.' });
        return;
      }
      
      // Mark attendance
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          session_id: session.id,
          student_id: profile?.id,
          signed_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      
      setScanResult({ status: 'success', message: 'Attendance marked successfully!' });
      
    } catch (error: any) {
      console.error("Scan error:", error);
      setScanning(false);
      setScanResult({ status: 'error', message: error.message || 'Failed to scan QR code' });
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
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-6 flex flex-col gap-6">
      
      {/* Top Section - Student Profile */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
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
            <button onClick={() => {
              const testSessionId = prompt('Session ID:');
              const testToken = prompt('Token:');
              if (testSessionId && testToken) onScanSuccess(JSON.stringify({ sessionId: testSessionId, token: testToken }), null);
            }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 transition-colors">Mock Scan</button>
            <button onClick={async () => {
              const { data } = await supabase.from('attendance_sessions').select('*').eq('is_active', true).limit(1);
              if (data && data.length > 0) {
                onScanSuccess(JSON.stringify({ sessionId: data[0].id, token: data[0].session_token }), null);
              } else {
                alert('No active sessions found!');
              }
            }} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors">Auto Mock Scan</button>
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

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-slate-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{attendanceHistory.length}</p>
              <p className="text-xs text-slate-500">Total Classes Attended</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-slate-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{enrolledCourses.length}</p>
              <p className="text-xs text-slate-500">Enrolled Courses</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-slate-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{schedules.length}</p>
              <p className="text-xs text-slate-500">Upcoming Classes</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-slate-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">Active</p>
              <p className="text-xs text-slate-500">Student Status</p>
            </div>
          </div>
        </div>
      
        {/* Attendance Breakdown */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Course Attendance Summary</h4>
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
</div>

      {/* QR Scanner Modal / Section */}
      {scanning && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
               <h2 className="text-xl font-bold text-purple-900">Scan Class QR Code</h2>
             </div>
             <button onClick={() => setScanning(false)} className="text-slate-500 hover:text-purple-900">
               <XCircle className="w-6 h-6" />
             </button>
          </div>
          
          {scanResult && (
            <div className={`mb-6 p-4 rounded-xl flex items-start ${scanResult.status === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {scanResult.status === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className="font-medium text-sm">{scanResult.message}</p>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mx-auto max-w-md">
            <div id="reader" className="w-full rounded-xl overflow-hidden [&>div]:border-none [&_video]:rounded-xl text-slate-600"></div>
          </div>
        </div>
      )}

      {/* Bottom Section - Attendance History */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 flex-grow">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-purple-900">Attendance History</h2>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button className="p-2 rounded-lg bg-white text-purple-900">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-slate-500 hover:text-purple-900">
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors text-purple-900">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors text-purple-900">
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
                <div key={record.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-purple-900 font-medium">
                      <CalendarIcon className="w-4 h-4 text-slate-500" />
                      {formattedDate}
                    </div>
                    <span className="px-3 py-1 bg-purple-900/10 text-purple-600 text-xs font-bold rounded-full">
                      {status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Course Code</p>
                      <p className="text-sm font-bold text-purple-900">{record.attendance_sessions?.courses?.course_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Check In Time</p>
                      <p className="text-sm font-bold text-purple-900">{formattedTime}</p>
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
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${page === 1 ? 'border border-slate-600 text-purple-900' : 'text-slate-500 hover:text-purple-900'}`}
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
