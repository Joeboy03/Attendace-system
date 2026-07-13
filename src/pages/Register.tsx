import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, UserPlus, Fingerprint } from 'lucide-react';
import { UserRole } from '../types';
import { fetchFaculties, fetchDepartments, createFaculty, createDepartment } from '../lib/departments';
import { Faculty, Department } from '../types';
import { useEffect } from 'react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'student';
  const [matricNumber, setMatricNumber] = useState('');
  
  const [level, setLevel] = useState('100 Level');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [facultiesList, setFacultiesList] = useState<Faculty[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);

  useEffect(() => {
    fetchFaculties().then(setFacultiesList);
  }, []);

  useEffect(() => {
    if (faculty) {
      // Here faculty is the ID or Name. In our schema, it should probably be the name since we save string in DB, but the ID is better for fetching.
      // For simplicity, assuming `faculty` state holds the faculty name. But fetchDepartments takes ID.
      // Let's modify fetchDepartments to be called with ID if needed. Wait, faculty state is currently Name.
      const f = facultiesList.find(fac => fac.name.toLowerCase() === faculty.toLowerCase());
      if (f) {
        fetchDepartments(f.id).then(setDepartmentsList);
      } else {
        setDepartmentsList([]);
      }
    } else {
      setDepartmentsList([]);
    }
  }, [faculty, facultiesList]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    

    let selectedFac = facultiesList.find(f => f.name.toLowerCase() === faculty.toLowerCase());
    if (!selectedFac) {
      selectedFac = await createFaculty(faculty);
    }
    
    let selectedDept = departmentsList.find(d => d.name.toLowerCase() === department.toLowerCase());
    if (!selectedDept && selectedFac) {
      selectedDept = await createDepartment(department, selectedFac.id);
    }
    
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
          role: 'student',
          matric_number: matricNumber,
          staff_id: null,
          level: level,
          faculty: selectedFac.name,
          department: selectedDept.name
        });

        if (dbError) throw dbError;
        await refreshProfile();
        
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
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-purple-600 mb-6 transform -rotate-3">
            <UserPlus className="w-8 h-8 rotate-3" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-purple-900 mb-1">Student Registration</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-8">
            Attendance Management System
          </p>
          
          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"
                placeholder="school@student.uniben.edu"
              />
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Matric Number
                </label>
                <input
                    type="text"
                    required
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"
                    placeholder="CSC170..."
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Level
                    </label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-purple-900 transition-colors appearance-none"
                    >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="500 Level">500 Level</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Faculty
                    </label>
                    <input
                        type="text"
                        required
                        list="faculty-list"
                        value={faculty}
                        onChange={(e) => { setFaculty(e.target.value); setDepartment(''); }}
                        placeholder="Type faculty name"
                        className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-purple-900 transition-colors"
                    />
                    <datalist id="faculty-list">
                        {facultiesList.map(fac => (
                          <option key={fac.id} value={fac.name} />
                        ))}
                    </datalist>
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Department
                </label>
                <input
                    type="text"
                    required
                    list="dept-list"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Type department name"
                    className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-purple-900 transition-colors disabled:opacity-50"
                    disabled={!faculty}
                />
                <datalist id="dept-list">
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name} />
                    ))}
                </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 bg-slate-50 transition-colors"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="text-red-700 bg-red-100 border border-red-200 p-3 rounded-xl text-sm font-medium mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white disabled:opacity-50 transition-colors mt-6"
            >
              {loading ? 'Creating Student Account...' : 'Register as Student'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">
                Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-500 uppercase font-bold tracking-wider">
          © 2026 University of Benin • CSC Final Year Project
        </p>
      </div>
    </div>
  );
}
