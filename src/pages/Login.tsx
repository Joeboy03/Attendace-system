import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191B] text-slate-300 font-sans p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        
        <div className="bg-[#232427] rounded-3xl border border-slate-800 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#2D2E32] border border-slate-700 rounded-2xl flex items-center justify-center text-[#60D8B6] mb-6 transform rotate-3">
            <GraduationCap className="w-8 h-8 -rotate-3" />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            University of Benin
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">
            Attendance Management System
          </p>
          
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 text-sm font-medium border border-slate-700 focus:outline-none focus:border-[#60D8B6] focus:ring-1 focus:ring-[#60D8B6] rounded-xl bg-[#18191B] text-white placeholder-slate-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-[#18191B] bg-[#60D8B6] hover:bg-[#4bc2a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60D8B6] focus:ring-offset-[#232427] disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center w-full pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400 font-medium mb-2">New to the system?</p>
            <Link to="/register" className="text-sm font-bold text-[#60D8B6] hover:text-[#4bc2a0] transition-colors">
                Create a Student or Lecturer Account
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-500 uppercase font-bold tracking-wider">
          © 2024 University of Benin • CSC Final Year Project
        </p>
      </div>
    </div>
  );
}
