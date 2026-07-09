import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://wzveperzwfyjtjkmcwwb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dmVwZXJ6d2Z5anRqa21jd3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Mjg0OTAsImV4cCI6MjA5OTEwNDQ5MH0.HMXKKT_d5310oEhXUXuIqto0Xk80QtKzBnGd3VmNQY4');

async function run() {
  console.log('Registering user...');
  const email = 'testuser12345@test.com';
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
  });
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }
  console.log('Auth data:', authData.user.id);

  const { error: dbError } = await supabase.from('users').insert({
    id: authData.user.id,
    full_name: 'Test User',
    email: email,
    role: 'student',
    matric_number: 'TEST12345',
    staff_id: null,
    level: '100 Level',
    faculty: 'Engineering',
    department: 'Computer Engineering'
  });
  
  if (dbError) {
    console.error('DB error:', dbError);
  } else {
    console.log('DB insert success');
  }
}
run();
