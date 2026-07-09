export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  matric_number?: string;
  staff_id?: string;
  level?: string;
  faculty?: string;
  department?: string;
  created_at: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  lecturer_id: string;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  course_id: string;
  lecturer_id: string;
  session_token: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  signed_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface ClassSchedule {
  id: string;
  course_id: string;
  lecturer_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
  course?: Partial<Course>;
}
