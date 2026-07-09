import React, { useState } from 'react';
import { Search, Filter, Loader2, User, Book, ClipboardCheck, GraduationCap, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type SearchCategory = 'students' | 'lecturers' | 'courses' | 'attendance';

export default function AdminSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<SearchCategory>('students');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      if (category === 'students') {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student')
          .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,matric_number.ilike.%${searchTerm}%`)
          .limit(20);
        setResults(data || []);
      } else if (category === 'lecturers') {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'lecturer')
          .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,staff_id.ilike.%${searchTerm}%`)
          .limit(20);
        setResults(data || []);
      } else if (category === 'courses') {
        const { data } = await supabase
          .from('courses')
          .select('*, lecturer:lecturer_id(full_name)')
          .or(`course_code.ilike.%${searchTerm}%,course_title.ilike.%${searchTerm}%`)
          .limit(20);
        setResults(data || []);
      } else if (category === 'attendance') {
        const { data: students } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .or(`full_name.ilike.%${searchTerm}%,matric_number.ilike.%${searchTerm}%`);
        
        const studentIds = students?.map(s => s.id) || [];
        
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .ilike('course_code', `%${searchTerm}%`);
        
        const courseIds = courses?.map(c => c.id) || [];

        const { data: sessions } = await supabase
          .from('attendance_sessions')
          .select('id')
          .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000']);
          
        const sessionIds = sessions?.map(s => s.id) || [];

        let query = supabase
          .from('attendance_records')
          .select(`
            *,
            student:student_id(full_name, matric_number),
            session:session_id(course:course_id(course_code, course_title), session_token)
          `);
        
        if (studentIds.length > 0 && sessionIds.length > 0) {
           query = query.or(`student_id.in.(${studentIds.join(',')}),session_id.in.(${sessionIds.join(',')})`);
        } else if (studentIds.length > 0) {
           query = query.in('student_id', studentIds);
        } else if (sessionIds.length > 0) {
           query = query.in('session_id', sessionIds);
        } else {
           setResults([]);
           setLoading(false);
           return;
        }

        const { data } = await query.order('signed_at', { ascending: false }).limit(30);
        setResults(data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'lecturers', label: 'Lecturers', icon: User },
    { id: 'courses', label: 'Courses', icon: Book },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  ] as const;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
          <Search className="w-4 h-4 mr-2" /> Global Search
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setResults([]);
                setHasSearched(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center ${
                category === cat.id 
                  ? 'bg-indigo-900 text-white shadow-sm' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5 mr-1.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${category}...`}
          className="w-full pl-12 pr-4 py-4 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        <button
          type="submit"
          disabled={loading || !searchTerm.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="min-h-[200px] flex flex-col">
        {!hasSearched ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Enter a search term to find records.</p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Filter className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No {category} found matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Found {results.length} result{results.length !== 1 && 's'}
            </p>
            {results.map((result, idx) => (
              <div key={result.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-colors">
                
                {category === 'students' && (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center">
                        {result.full_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{result.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {result.matric_number || 'N/A'}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {result.level || 'Unknown Level'}
                      </span>
                    </div>
                  </>
                )}

                {category === 'lecturers' && (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{result.full_name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{result.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {result.staff_id || 'N/A'}
                      </span>
                    </div>
                  </>
                )}

                {category === 'courses' && (
                  <>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-black rounded-md">
                          {result.course_code}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{result.course_title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Lecturer: {result.lecturer?.full_name || 'Unassigned'}</p>
                    </div>
                  </>
                )}

                {category === 'attendance' && (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md">
                          {result.session?.course?.course_code}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{result.student?.full_name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{result.student?.matric_number}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end text-xs font-semibold text-slate-700 mb-1">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {format(new Date(result.signed_at), 'MMM d, yyyy')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {format(new Date(result.signed_at), 'h:mm a')}
                      </div>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
