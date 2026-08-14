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

async function fixPolicies() {
  const query = `
    DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;
    CREATE POLICY "Admins can manage all businesses" ON public.businesses
      FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
      
    DROP POLICY IF EXISTS "Owners can update their businesses" ON public.businesses;
    CREATE POLICY "Owners can update their businesses" ON public.businesses
      FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  `;
  
  // Actually, Supabase JS can't run arbitrary SQL unless we use RPC.
  // I will write it as a migration script and the user can run it, or they can confirm the error message first.
}
