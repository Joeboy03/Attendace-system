import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { Course, ClassSchedule } from '../types';
import { LogOut, PlusCircle, Camera, CheckCircle, XCircle, Calendar as CalendarIcon, Download, LayoutGrid, List, ArrowUpDown, Filter, ChevronDown, ChevronRight, Target, Award, Clock, Fingerprint } from 'lucide-react';
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
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedCourseToRegister, setSelectedCourseToRegister] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(profile?.department || '');

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
  
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [profile, refreshKey]);

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

  
  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('course_code', { ascending: true });
      if (data) setAvailableCourses(data);
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    fetchAvailableCourses();
  }, []);
  
  const handleRegisterCourse = async () => {
    if (!selectedCourseToRegister || !profile) return;
    setIsRegistering(true);
    try {
      // check if already enrolled
      if (enrolledCourses.find(c => c.course_id === selectedCourseToRegister)) {
        toast.error('Already registered for this course');
        setIsRegistering(false);
        return;
      }
      
      const { error } = await supabase.from('enrollments').insert({
        student_id: profile.id,
        course_id: selectedCourseToRegister
      });
      if (error) throw error;
      toast.success('Successfully registered for course!');
      fetchEnrollments();
      setSelectedCourseToRegister('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to register course');
    } finally {
      setIsRegistering(false);
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
    const getAiInsight = async () => {
      if (!profile) return;
      setInsightLoading(true);
      try {
        const response = await fetch('/api/ai/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendanceHistory, studentInfo: profile })
        });
        const result = await response.json();
        setAiInsight(result.prediction);
      } catch(e) {
         console.error(e);
      } finally {
        setInsightLoading(false);
      }
    };
    if (attendanceHistory.length > 0) {
      getAiInsight();
    }
  }, [attendanceHistory.length]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    try {
      if (!profile?.matric_number) {
        setScanning(false);
        setIsEditingProfile(true);
        return;
      }

      const data = JSON.parse(decodedText);
      if (!data.sessionId || !data.token) throw new Error("Invalid QR Code format");
      
      setScanning(false);
      setScanResult(null);

      // Parse dynamic geofencing from token if present
      let requiredLat: number | null = null;
      let requiredLng: number | null = null;
      try {
        const parsedToken = JSON.parse(data.token);
        if (parsedToken.lat && parsedToken.lng) {
          requiredLat = parsedToken.lat;
          requiredLng = parsedToken.lng;
        }
      } catch(e) {
        // Geofencing not required for this session
      }

      const processAttendance = async (lat?: number, lng?: number) => {
        try {
            if (requiredLat !== null && requiredLng !== null && lat !== undefined && lng !== undefined) {
              const distance = Math.sqrt(Math.pow(lat - requiredLat, 2) + Math.pow(lng - requiredLng, 2));
              // Allow within approx 50-100 meters (roughly 0.0005 to 0.001 degrees)
              if (distance > 0.001) {
                throw new Error("You are too far from the class location to sign in.");
              }
            }
            
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
            
            const { error: insertError } = await supabase
              .from('attendance_records')
              .insert({
                session_id: session.id,
                student_id: profile?.id,
                signed_at: new Date().toISOString()
              });
              
            if (insertError) throw insertError;
            
            setScanResult({ status: 'success', message: 'Attendance recorded successfully!' });
            setRefreshKey(prev => prev + 1);
        } catch(err: any) {
            setScanResult({ status: 'error', message: err.message || "Failed to mark attendance" });
        }
      };

      if (requiredLat !== null && requiredLng !== null) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              processAttendance(position.coords.latitude, position.coords.longitude);
            }, 
            (error) => {
              setScanResult({ status: 'error', message: "Location access is required for this session." });
            }
          );
        } else {
          setScanResult({ status: 'error', message: "Geolocation is not supported by your browser." });
        }
      } else {
        // No geofence required
        processAttendance();
      }

    } catch (error: any) {
      console.error("Scan error:", error);
      setScanResult({ status: 'error', message: error.message || 'Failed to scan code.' });
    }
  };

  const onScanFailure = (error: any) => {
    // Usually ignoring regular scan failures since it scans constantly
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B090F] text-slate-900 dark:text-purple-50 font-sans p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden gap-6">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100/50 dark:from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-purple-900/5 border border-white/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform"><Fingerprint className="w-8 h-8 -rotate-3" /></div>
          <div>
            <h1 className="text-2xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900 dark:text-purple-50">University of Benin</h1>
            <p className="text-xs text-slate-500 dark:text-purple-400 font-medium uppercase tracking-wider">Attendance Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="sm" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-purple-100">{profile?.full_name}</p>
            <p className="text-xs text-purple-600 font-medium">{profile?.matric_number}</p>
          </div>
          <ThemeSwitcher />
          <button 
            onClick={signOut}
            className="w-12 h-12 bg-red-50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-100 dark:bg-red-900/30 hover:text-red-700 transition-colors shadow-sm dark:shadow-none"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-grow relative z-10">
        
        {/* Left Column: Student Profile & Stats */}
        <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#15111D] rounded-3xl border-2 border-slate-200 dark:border-[#2C2142] p-6 shadow-sm dark:shadow-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <AvatarUploader userId={profile?.id || ""} name={profile?.full_name || "Student"} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-purple-100 mb-2">{profile?.full_name || 'Student Name'}</h3>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-purple-500 font-bold uppercase tracking-wider">Level</span>
                    <span className="text-sm font-semibold text-purple-900">{profile?.level || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-purple-500 font-bold uppercase tracking-wider">Department</span>
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

          {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#15111D] rounded-2xl p-4 flex items-center gap-4 border border-slate-200 dark:border-[#2C2142]">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-slate-500 dark:text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{attendanceHistory.length}</p>
              <p className="text-xs text-slate-500 dark:text-purple-400">Total Classes Attended</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#15111D] rounded-2xl p-4 flex items-center gap-4 border border-slate-200 dark:border-[#2C2142]">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-slate-500 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{enrolledCourses.length}</p>
              <p className="text-xs text-slate-500 dark:text-purple-400">Enrolled Courses</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#15111D] rounded-2xl p-4 flex items-center gap-4 border border-slate-200 dark:border-[#2C2142]">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-slate-500 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">{schedules.length}</p>
              <p className="text-xs text-slate-500 dark:text-purple-400">Upcoming Classes</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#15111D] rounded-2xl p-4 flex items-center gap-4 border border-slate-200 dark:border-[#2C2142]">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-slate-500 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-900">Active</p>
              <p className="text-xs text-slate-500 dark:text-purple-400">Student Status</p>
            </div>
          </div>
        </div>
      
        {/* Attendance Breakdown */}
        <div className="mt-8 border-t border-slate-200 dark:border-[#2C2142] pt-8">
          <h4 className="text-lg font-bold text-slate-800 dark:text-purple-100 mb-4 flex items-center">
             <Target className="w-5 h-5 mr-2 text-purple-500" />
             Course Attendance Summary
          </h4>
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-purple-400">You are not enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map(enrollment => {
                const courseCode = enrollment.courses?.course_code;
                const courseTitle = enrollment.courses?.course_title;
                const attended = attendanceHistory.filter(record => record.attendance_sessions?.courses?.course_code === courseCode).length;
                return (
                  <div key={enrollment.id} className="bg-slate-50 dark:bg-[#0B090F] rounded-2xl p-4 border border-slate-200 dark:border-[#2C2142] flex justify-between items-center hover:border-purple-300 transition-colors">
                    <div>
                      <p className="font-bold text-purple-900">{courseCode}</p>
                      <p className="text-xs text-slate-500 dark:text-purple-400 truncate max-w-[150px]">{courseTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-purple-900">{attended}</p>
                      <p className="text-[10px] text-slate-500 dark:text-purple-400 uppercase tracking-widest font-bold">Attended</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Bottom Section - Attendance History */}
        <div className="mt-8 border-t border-slate-200 dark:border-[#2C2142] pt-8">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-purple-100 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
              Recent Attendance
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attendanceHistory.length === 0 ? (
               <div className="col-span-full py-8 text-center text-slate-500 dark:text-purple-400">
                 No attendance records found.
               </div>
            ) : (
              attendanceHistory.slice(0, 6).map(record => {
                const date = new Date(record.signed_at);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                return (
                  <div key={record.id} className="bg-white dark:bg-[#15111D] rounded-2xl p-4 border border-slate-200 dark:border-[#2C2142] flex flex-col justify-between hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="font-bold text-purple-900">{record.attendance_sessions?.courses?.course_code || 'N/A'}</p>
                         <p className="text-xs text-slate-500 dark:text-purple-400 truncate max-w-[150px]">{record.attendance_sessions?.courses?.course_title || 'N/A'}</p>
                       </div>
                       <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Present</span>
                    </div>
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100 dark:border-[#2C2142]/60">
                       <p className="text-xs font-medium text-slate-600 dark:text-purple-300 flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/> {formattedDate}</p>
                       <p className="text-xs font-medium text-slate-600 dark:text-purple-300 flex items-center"><Clock className="w-3 h-3 mr-1"/> {formattedTime}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Right Column: AI Insights & Scanning */}
      <div className="md:col-span-2 xl:col-span-1 flex flex-col gap-6">
        
        {/* QR Scanner Section (always visible on desktop, modal on mobile) */}
        {scanning && (
          <div className="bg-white dark:bg-[#15111D] rounded-3xl border-2 border-slate-200 dark:border-[#2C2142] p-6 shadow-sm dark:shadow-none flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-slate-800 dark:text-purple-100 flex items-center">
                 <Camera className="w-5 h-5 mr-2 text-purple-500" />
                 Scan Class QR
               </h2>
               <button onClick={() => setScanning(false)} className="text-slate-400 dark:text-purple-500 hover:text-red-500 transition-colors">
                 <XCircle className="w-5 h-5" />
               </button>
            </div>
            
            {scanResult && (
              <div className={`mb-6 p-4 rounded-xl flex items-start ${scanResult.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200'}`}>
                {scanResult.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <p className="font-medium text-sm">{scanResult.message}</p>
              </div>
            )}
            
            <div className="bg-slate-50 dark:bg-[#0B090F] p-2 rounded-2xl border border-slate-200 dark:border-[#2C2142] mx-auto w-full max-w-[280px]">
              <div id="reader" className="w-full rounded-xl overflow-hidden [&>div]:border-none [&_video]:rounded-xl text-slate-600 dark:text-purple-300"></div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col min-h-[250px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2">AI Attendance Insights</h2>
              <p className="text-purple-200 text-sm leading-relaxed mb-6">
                {aiInsight || "Attend more classes to generate personalized AI insights about your performance and attendance patterns."}
              </p>
            </div>
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold transition-colors">
              Refresh Insights
            </button>
          </div>
        </div>

      </div>
      
    </div>
  </div>
  );
}
