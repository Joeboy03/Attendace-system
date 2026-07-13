const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://wzveperzwfyjtjkmcwwb.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY
);
async function test() {
  const { data, error } = await supabase.from('attendance_sessions').insert({
    course_id: '00000000-0000-0000-0000-000000000000',
    lecturer_id: '00000000-0000-0000-0000-000000000000',
    latitude: 0,
    longitude: 0
  });
  console.log(error);
}
test();
