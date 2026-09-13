import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ocyphrcgktochijuozwe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TsibJVXzL9pOAiM_Az8vhA_nKg3z2nt';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await client
    .from('enquiries')
    .insert({
      name: 'Direct Anon Test',
      company: 'Testing Corp',
      email: 'direct.test@example.com',
      phone: '+91 98765 43210',
      subject: 'Test Subject',
      message: 'Testing anonymous insert permission without returning',
      source: 'website',
      status: 'new',
    });

  console.log('Result without select():', { data, error });
}

run();
