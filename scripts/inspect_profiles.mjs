import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ocyphrcgktochijuozwe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TsibJVXzL9pOAiM_Az8vhA_nKg3z2nt';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
  const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
    email: 'admin@akiraautomation.com',
    password: 'Admin@123',
  });

  if (loginError) {
    console.error('Admin login error:', loginError);
    return;
  }

  console.log('Admin logged in:', loginData.user.email);

  const { data: profiles, error: profError } = await client
    .from('profiles')
    .select('id, email, full_name, role, active');
  console.log('Current profiles in database:', JSON.stringify(profiles, null, 2));

  const moorthiProfile = profiles?.find(p => p.email === 'moorthi832002@gmail.com');
  console.log('Moorthi profile:', moorthiProfile);

  if (moorthiProfile) {
    console.log('Testing update moorthi to "staff"...');
    const { data: resStaff, error: errStaff } = await client
      .from('profiles')
      .update({ role: 'staff' })
      .eq('id', moorthiProfile.id)
      .select();
    console.log('Update to "staff" result:', resStaff, 'error:', errStaff?.message);

    console.log('Testing update moorthi to "STAFF"...');
    const { data: resStaffUpper, error: errStaffUpper } = await client
      .from('profiles')
      .update({ role: 'STAFF' })
      .eq('id', moorthiProfile.id)
      .select();
    console.log('Update to "STAFF" result:', resStaffUpper, 'error:', errStaffUpper?.message);

    console.log('Testing update moorthi to "admin"...');
    const { data: resAdmin, error: errAdmin } = await client
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', moorthiProfile.id)
      .select();
    console.log('Update to "admin" result:', resAdmin, 'error:', errAdmin?.message);

    console.log('Testing update moorthi to "manager"...');
    const { data: resManager, error: errManager } = await client
      .from('profiles')
      .update({ role: 'manager' })
      .eq('id', moorthiProfile.id)
      .select();
    console.log('Update to "manager" result:', resManager, 'error:', errManager?.message);

    console.log('Testing update moorthi to "viewer"...');
    const { data: resViewer, error: errViewer } = await client
      .from('profiles')
      .update({ role: 'viewer' })
      .eq('id', moorthiProfile.id)
      .select();
    console.log('Update to "viewer" result:', resViewer, 'error:', errViewer?.message);
  }
}

inspect();
