import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ocyphrcgktochijuozwe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TsibJVXzL9pOAiM_Az8vhA_nKg3z2nt';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function restore() {
  const { data: loginData } = await client.auth.signInWithPassword({
    email: 'admin@akiraautomation.com',
    password: 'Admin@123',
  });

  const { data, error } = await client
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', 'moorthi832002@gmail.com')
    .select();

  console.log('Restored moorthi to admin:', data, 'error:', error);
}

restore();
