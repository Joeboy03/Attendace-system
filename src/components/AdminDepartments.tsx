import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { fetchFaculties, fetchDepartments, createFaculty, createDepartment, deleteFaculty, deleteDepartment } from '../lib/departments';
import { Faculty, Department } from '../types';

export default function AdminDepartments() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facultiesData, departmentsData] = await Promise.all([
        fetchFaculties(),
        fetchDepartments()
      ]);
      setFaculties(facultiesData);
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Failed to load faculties and departments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const faculty = await createFaculty(newFacultyName.trim());
      setFaculties([...faculties, faculty]);
      setNewFacultyName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !selectedFacultyId) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const dept = await createDepartment(newDepartmentName.trim(), selectedFacultyId);
      setDepartments([...departments, dept]);
      setNewDepartmentName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this faculty? This will also delete all associated departments.')) return;
    try {
      await deleteFaculty(id);
      setFaculties(faculties.filter(f => f.id !== id));
      setDepartments(departments.filter(d => d.faculty_id !== id));
    } catch (err) {
      console.error('Failed to delete faculty', err);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete department', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mr-4">
          <Building2 className="w-5 h-5 text-indigo-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Department Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage master list of faculties and departments</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Faculties Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Faculties</h3>
          
          <form onSubmit={handleAddFaculty} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFacultyName}
              onChange={(e) => setNewFacultyName(e.target.value)}
              placeholder="New Faculty Name"
              className="flex-1 px-4 py-2 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newFacultyName.trim()}
              className="px-4 py-2 bg-indigo-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-800 disabled:opacity-50 transition-colors flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add
            </button>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {faculties.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No faculties found.</p>
            ) : (
              faculties.map(faculty => (
                <div key={faculty.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                  <span className="text-sm font-bold text-slate-700">{faculty.name}</span>
                  <button
                    onClick={() => handleDeleteFaculty(faculty.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Faculty"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departments Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Departments</h3>
          
          <form onSubmit={handleAddDepartment} className="flex flex-col gap-2 mb-4">
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full px-4 py-2 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl bg-slate-50 text-slate-900"
            >
              <option value="">Select Faculty...</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="New Department Name"
                className="flex-1 px-4 py-2 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newDepartmentName.trim() || !selectedFacultyId}
                className="px-4 py-2 bg-indigo-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-800 disabled:opacity-50 transition-colors flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No departments found.</p>
            ) : (
              departments.map(dept => (
                <div key={dept.id} className="flex flex-col p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">{dept.name}</span>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {dept.faculty?.name || 'Unknown Faculty'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
