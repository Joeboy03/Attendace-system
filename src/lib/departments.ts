import { supabase } from './supabase';
import { Faculty, Department } from '../types';

const LOCAL_STORAGE_FACULTIES_KEY = 'fallback_faculties';
const LOCAL_STORAGE_DEPARTMENTS_KEY = 'fallback_departments';

export const fetchFaculties = async (): Promise<Faculty[]> => {
  try {
    const { data, error } = await supabase.from('faculties').select('*').order('name');
    if (error) {
      if (error.code === '42P01') {
        return getLocalFaculties();
      }
      throw error;
    }
    return data as Faculty[];
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return getLocalFaculties();
  }
};

export const fetchDepartments = async (facultyId?: string): Promise<Department[]> => {
  try {
    let query = supabase.from('departments').select('*, faculty:faculty_id(name)').order('name');
    if (facultyId) {
      query = query.eq('faculty_id', facultyId);
    }
    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01') {
        return getLocalDepartments(facultyId);
      }
      throw error;
    }
    return data as Department[];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return getLocalDepartments(facultyId);
  }
};

export const createFaculty = async (name: string): Promise<Faculty> => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .insert([{ name }])
      .select('*')
      .single();
    if (error) {
      if (error.code === '42P01') {
        return addLocalFaculty(name);
      }
      throw error;
    }
    return data as Faculty;
  } catch (error) {
    console.error('Error creating faculty:', error);
    return addLocalFaculty(name);
  }
};

export const createDepartment = async (name: string, facultyId: string): Promise<Department> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([{ name, faculty_id: facultyId }])
      .select('*, faculty:faculty_id(name)')
      .single();
    if (error) {
      if (error.code === '42P01') {
        return addLocalDepartment(name, facultyId);
      }
      throw error;
    }
    return data as Department;
  } catch (error) {
    console.error('Error creating department:', error);
    return addLocalDepartment(name, facultyId);
  }
};

export const deleteFaculty = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('faculties').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01') {
        removeLocalFaculty(id);
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting faculty:', error);
    removeLocalFaculty(id);
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01') {
        removeLocalDepartment(id);
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting department:', error);
    removeLocalDepartment(id);
  }
};

const getLocalFaculties = (): Faculty[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_FACULTIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getLocalDepartments = (facultyId?: string): Department[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY);
  let departments: Department[] = stored ? JSON.parse(stored) : [];
  if (facultyId) {
    departments = departments.filter(d => d.faculty_id === facultyId);
  }
  return departments;
};

const addLocalFaculty = (name: string): Faculty => {
  const newFaculty: Faculty = {
    id: crypto.randomUUID(),
    name,
    created_at: new Date().toISOString(),
  };
  const faculties = getLocalFaculties();
  faculties.push(newFaculty);
  localStorage.setItem(LOCAL_STORAGE_FACULTIES_KEY, JSON.stringify(faculties));
  return newFaculty;
};

const addLocalDepartment = (name: string, facultyId: string): Department => {
  const faculties = getLocalFaculties();
  const faculty = faculties.find(f => f.id === facultyId);
  
  const newDept: Department = {
    id: crypto.randomUUID(),
    name,
    faculty_id: facultyId,
    created_at: new Date().toISOString(),
    faculty: faculty ? { name: faculty.name } : undefined,
  };
  const departments = getLocalDepartments();
  departments.push(newDept);
  localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(departments));
  return newDept;
};

const removeLocalFaculty = (id: string) => {
  let faculties = getLocalFaculties();
  faculties = faculties.filter(f => f.id !== id);
  localStorage.setItem(LOCAL_STORAGE_FACULTIES_KEY, JSON.stringify(faculties));
  
  let departments = getLocalDepartments();
  departments = departments.filter(d => d.faculty_id !== id);
  localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(departments));
};

const removeLocalDepartment = (id: string) => {
  let departments = getLocalDepartments();
  departments = departments.filter(d => d.id !== id);
  localStorage.setItem(LOCAL_STORAGE_DEPARTMENTS_KEY, JSON.stringify(departments));
};
