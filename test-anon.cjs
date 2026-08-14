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
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('businesses').select('id, name');
  console.log('Error:', error);
  console.log('Businesses count for Anon:', data ? data.length : 0);
}

test();
