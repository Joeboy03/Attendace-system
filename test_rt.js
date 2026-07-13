import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://wzveperzwfyjtjkmcwwb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dmVwZXJ6d2Z5anRqa21jd3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Mjg0OTAsImV4cCI6MjA5OTEwNDQ5MH0.HMXKKT_d5310oEhXUXuIqto0Xk80QtKzBnGd3VmNQY4');

const channel = supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'attendance_sessions' },
    (payload) => console.log(payload)
  )
  .subscribe((status) => console.log(status));

setTimeout(() => process.exit(0), 2000);
