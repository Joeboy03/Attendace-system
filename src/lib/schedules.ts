import { supabase } from './supabase';
import { ClassSchedule } from '../types';

const LOCAL_STORAGE_KEY = 'fallback_class_schedules';

export const fetchSchedules = async (filters?: { course_id?: string; lecturer_id?: string; course_ids?: string[] }): Promise<ClassSchedule[]> => {
  try {
    let query = supabase
      .from('class_schedules')
      .select('*, course:course_id(course_code, course_title)');
      
    if (filters?.course_id) {
      query = query.eq('course_id', filters.course_id);
    }
    if (filters?.lecturer_id) {
      query = query.eq('lecturer_id', filters.lecturer_id);
    }
    if (filters?.course_ids && filters.course_ids.length > 0) {
      query = query.in('course_id', filters.course_ids);
    }

    const { data, error } = await query;
      
    if (error) {
      if (error.code === '42P01') {
        console.warn('class_schedules table does not exist in Supabase. Falling back to local storage.');
        return getLocalSchedules(filters);
      }
      throw error;
    }
    
    return data as ClassSchedule[];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return getLocalSchedules(filters);
  }
};

export const createSchedule = async (schedule: Omit<ClassSchedule, 'id' | 'created_at' | 'course'>): Promise<ClassSchedule> => {
  try {
    const { data, error } = await supabase
      .from('class_schedules')
      .insert([schedule])
      .select('*, course:course_id(course_code, course_title)')
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.warn('class_schedules table does not exist in Supabase. Saving to local storage.');
        return addLocalSchedule(schedule);
      }
      throw error;
    }

    return data as ClassSchedule;
  } catch (error) {
    console.error('Error creating schedule:', error);
    return addLocalSchedule(schedule);
  }
};

const getLocalSchedules = (filters?: { course_id?: string; lecturer_id?: string; course_ids?: string[] }): ClassSchedule[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  let schedules: ClassSchedule[] = stored ? JSON.parse(stored) : [];
  
  if (filters) {
    if (filters.course_id) {
      schedules = schedules.filter(s => s.course_id === filters.course_id);
    }
    if (filters.lecturer_id) {
      schedules = schedules.filter(s => s.lecturer_id === filters.lecturer_id);
    }
    if (filters.course_ids && filters.course_ids.length > 0) {
      schedules = schedules.filter(s => filters.course_ids!.includes(s.course_id));
    }
  }
  
  return schedules;
};

const addLocalSchedule = (schedule: Omit<ClassSchedule, 'id' | 'created_at' | 'course'>): ClassSchedule => {
  const newSchedule: ClassSchedule = {
    ...schedule,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  
  const schedules = getLocalSchedules();
  schedules.push(newSchedule);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
  
  return newSchedule;
};
