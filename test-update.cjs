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

async function testUpdate() {
  const businessId = 'c88c086d-3e6d-4f81-8314-3170659a8307'; // shashi
  console.log('Updating business:', businessId);
  const { data, error } = await supabase
    .from('businesses')
    .update({ status: 'approved' })
    .eq('id', businessId)
    .select();
  
  console.log('Error:', error);
  console.log('Data:', data);
}

testUpdate();
