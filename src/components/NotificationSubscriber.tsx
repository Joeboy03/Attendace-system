import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Bell, Info } from 'lucide-react';

export default function NotificationSubscriber() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    // 1. Listen for new attendance sessions (for students)
    // When an attendance session is inserted, if the student is enrolled in that course, show a notification.
    let sessionSub = null;
    
    if (profile.role === 'student') {
      const fetchStudentCourses = async () => {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id, courses(course_code, course_title)')
          .eq('student_id', profile.id);
          
        if (enrollments && enrollments.length > 0) {
          const courseIds = enrollments.map(e => e.course_id);
          
          sessionSub = supabase
            .channel('public:attendance_sessions')
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'attendance_sessions' },
              (payload) => {
                const newSession = payload.new;
                if (courseIds.includes(newSession.course_id)) {
                  // Find course details
                  const course = enrollments.find(e => e.course_id === newSession.course_id)?.courses;
                  if (course) {
                    toast(
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-purple-50 text-sm">Attendance Opened</p>
                          <p className="text-xs text-slate-600 dark:text-purple-300">Attendance is now open for {(course as any).course_code || (course as any)[0]?.course_code}.</p>
                        </div>
                      </div>,
                      { duration: 6000, position: 'top-right' }
                    );
                  }
                }
              }
            )
            .subscribe();
        }
      };
      
      fetchStudentCourses();
    }

    // 2. Listen for Broadcast events for Lecturer Updates
    const broadcastSub = supabase
      .channel('uniben_updates')
      .on(
        'broadcast',
        { event: 'lecturer_update' },
        (payload) => {
          // If the payload has course_id, we could filter it, but let's just show it if student is enrolled or if it's admin/lecturer.
          toast(
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-purple-50 text-sm">Course Update</p>
                <p className="text-xs text-slate-600 dark:text-purple-300">{payload.payload.message}</p>
                {payload.payload.course_code && (
                   <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">{payload.payload.course_code}</p>
                )}
              </div>
            </div>,
            { duration: 6000, position: 'top-right' }
          );
        }
      )
      .subscribe();

    return () => {
      if (sessionSub) supabase.removeChannel(sessionSub);
      if (broadcastSub) supabase.removeChannel(broadcastSub);
    };
  }, [profile]);

  return null;
}
