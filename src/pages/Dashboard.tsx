import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import LecturerDashboard from './LecturerDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'student':
      return <StudentDashboard />;
    case 'lecturer':
      return <LecturerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Invalid Role</div>;
  }
}
