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
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-600 font-sans p-6 flex flex-col items-center justify-center">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-300/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/30 blur-[100px] pointer-events-none" />
      <div className="w-full max-w-md">
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-purple-900/5 p-10 flex flex-col items-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-900/20 transform rotate-3 hover:rotate-6 transition-transform">
            <GraduationCap className="w-10 h-10 -rotate-3" />
          </div>
          
          <h2 className="text-3xl font-[Space_Grotesk] font-bold tracking-tight text-slate-900 mb-2">
            University of Benin
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-8">
            Attendance Management System
          </p>
          
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-5 pr-5 py-4 text-sm font-medium border-2 border-slate-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-5 pr-5 py-4 text-sm font-medium border-2 border-slate-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-700 bg-red-100 border border-red-200 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20 mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center w-full pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 font-medium mb-2">New to the system?</p>
            <Link to="/register" className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">
                Create a Student Account
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
