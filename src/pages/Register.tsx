import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, UserPlus } from 'lucide-react';
import { UserRole } from '../types';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [matricNumber, setMatricNumber] = useState('');
  const [staffId, setStaffId] = useState('');
  const [level, setLevel] = useState('100 Level');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Add the user to our public.users table with their specific role data
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          role: role,
          matric_number: role === 'student' ? matricNumber : null,
          staff_id: role === 'lecturer' ? staffId : null,
          level: role === 'student' ? level : null
        });

        if (dbError) throw dbError;
        
        // Registration successful
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-900 rounded-2xl flex items-center justify-center text-white mb-6 transform -rotate-3">
            <UserPlus className="w-8 h-8 text-white rotate-3" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900 mb-1">
            Create Account
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-8">
            Attendance Management System
          </p>
          
          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                placeholder="school@student.uniben.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                    {role === 'student' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Matric Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={matricNumber}
                                    onChange={(e) => setMatricNumber(e.target.value)}
                                    className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="CSC170..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Level
                                </label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 transition-colors appearance-none"
                                >
                                    <option value="100 Level">100 Level</option>
                                    <option value="200 Level">200 Level</option>
                                    <option value="300 Level">300 Level</option>
                                    <option value="400 Level">400 Level</option>
                                    <option value="500 Level">500 Level</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Staff ID
                            </label>
                            <input
                                type="text"
                                required
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                                placeholder="L-12345"
                            />
                        </>
                    )}
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 mt-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-sm font-medium mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors mt-6"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-400 uppercase font-bold tracking-wider">
          © 2024 University of Benin • CSC Final Year Project
        </p>

      </div>
    </div>
  );
}
