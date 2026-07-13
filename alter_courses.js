import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://wzveperzwfyjtjkmcwwb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dmVwZXJ6d2Z5anRqa21jd3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Mjg0OTAsImV4cCI6MjA5OTEwNDQ5MH0.HMXKKT_d5310oEhXUXuIqto0Xk80QtKzBnGd3VmNQY4');
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: `
    ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS faculty text;
    ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS department text;
  ` });
  console.log(error);
}
run();
