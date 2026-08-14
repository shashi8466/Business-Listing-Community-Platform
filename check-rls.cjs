const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...valParts] = line.split('=');
  let val = valParts.join('=');
  if (key && val) {
    val = val.replace(/^["'](.*)["']$/, '$1').trim();
    acc[key.trim()] = val;
  }
  return acc;
}, {});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'SELECT relrowsecurity FROM pg_class WHERE relname = \'businesses\';' });
  console.log('RLS Enabled?:', data);
}

checkRLS();
