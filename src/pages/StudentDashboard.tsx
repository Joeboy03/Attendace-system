import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, ClassSchedule } from '../types';
import { LogOut, Camera, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
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
            <p className="text-xs text-indigo-600 font-medium">Student • {profile?.matric_number}</p>
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
        
        {/* Scanner */}
        <div className="xl:col-span-4 bg-indigo-900 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative min-h-[350px]">
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full flex items-center">
                <Camera className="w-3 h-3 mr-1" /> SCANNER
             </span>
          </div>

          <div className="w-full max-w-sm mt-8">
            {scanResult && (
              <div className={`mb-6 p-4 rounded-xl flex items-start ${scanResult.status === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-red-100 text-red-800 border-2 border-red-200'}`}>
                {scanResult.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <p className="font-medium text-sm">{scanResult.message}</p>
              </div>
            )}

            {scanning ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="bg-white p-2 rounded-2xl shadow-inner w-full">
                  <div id="reader" className="w-full rounded-xl overflow-hidden [&>div]:border-none [&_video]:rounded-xl"></div>
                </div>
                <button
                  onClick={() => setScanning(false)}
                  className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-indigo-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel Scanning
                </button>
              </div>
            ) : (
              <button
                onClick={() => { 
                  if (!profile?.matric_number) {
                    setIsEditingProfile(true);
                  } else {
                    setScanning(true); 
                    setScanResult(null); 
                  }
                }}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-indigo-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all transform hover:scale-105"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan Class QR Code
              </button>
            )}
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="xl:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm min-h-[350px]">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Enrolled Courses</h2>
          
          {enrolledCourses.length > 0 ? (
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
              {enrolledCourses.map((enrollment) => (
                <div key={enrollment.id} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-200 transition-colors">
                  <div>
                    <p className="text-sm font-black text-slate-800">{enrollment.courses.course_code}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{enrollment.courses.course_title}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm font-medium text-center">You are not enrolled in any courses yet.</p>
            </div>
          )}
        </div>
        
        {/* Profile Card */}
        <div className="xl:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Student Profile</h2>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="flex flex-col flex-grow text-sm">
              {profileUpdateMsg && (
                <div className={`mb-4 p-2 rounded-lg text-xs font-medium ${profileUpdateMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {profileUpdateMsg.text}
                </div>
              )}
              
              <div className="space-y-3 flex-grow">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.full_name} 
                    onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Matric Number</label>
                  <input 
                    type="text" 
                    value={profileForm.matric_number} 
                    onChange={e => setProfileForm({...profileForm, matric_number: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Level</label>
                  <select
                    value={profileForm.level}
                    onChange={e => setProfileForm({...profileForm, level: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Faculty</label>
                  <select
                    value={profileForm.faculty}
                    onChange={e => setProfileForm({...profileForm, faculty: e.target.value, department: ''})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="" disabled>Select Faculty</option>
                    {facultiesList.map(faculty => (
                      <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Department</label>
                  <select
                    value={profileForm.department}
                    onChange={e => setProfileForm({...profileForm, department: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                    disabled={!profileForm.faculty}
                  >
                    <option value="" disabled>Select Department</option>
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold text-3xl mb-4 shadow-inner">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <h3 className="font-bold text-slate-800 text-lg text-center leading-tight">{profile?.full_name}</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mt-2 text-center">
                  {profile?.matric_number || 'No Matric Number'}
                </span>
              </div>
              
              <div className="space-y-4 flex-grow flex flex-col justify-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Level</p>
                  <p className="text-sm font-semibold text-slate-700">{profile?.level || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm font-semibold text-slate-700">{profile?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty</p>
                  <p className="text-sm font-semibold text-slate-700">{profile?.faculty || 'N/A'}</p>
                </div>
              </div>
            </>
          )}
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

