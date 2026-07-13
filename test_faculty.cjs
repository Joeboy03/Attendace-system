const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      users (
        faculty,
        department
      )
    `).limit(1);
  console.log(JSON.stringify(data, null, 2));
}

test();
