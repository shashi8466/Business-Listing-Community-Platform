const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...valParts] = line.split('=');
  let val = valParts.join('=');
  if (key && val) {
    // Remove quotes
    val = val.replace(/^["'](.*)["']$/, '$1').trim();
    acc[key.trim()] = val;
  }
  return acc;
}, {});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'];

console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('businesses').select('id, name, status, owner_id');
  if (error) console.error("Error:", error);
  else {
    console.log("Businesses:", JSON.stringify(data, null, 2));
    
    // Check user roles
    const { data: roles } = await supabase.from('user_roles').select('*');
    console.log("User Roles:", JSON.stringify(roles, null, 2));
  }
}

check();
