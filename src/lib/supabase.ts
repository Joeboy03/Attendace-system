import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wzveperzwfyjtjkmcwwb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dmVwZXJ6d2Z5anRqa21jd3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Mjg0OTAsImV4cCI6MjA5OTEwNDQ5MH0.HMXKKT_d5310oEhXUXuIqto0Xk80QtKzBnGd3VmNQY4';

export const supabase = createClient(supabaseUrl, supabaseKey);
