import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjaubxswaoyzbiomwnwc.supabase.co';
const supabaseKey = 'sb_publishable_6JAFuyuy2EprM4zph7U2-g_htwGh1lI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchRecentIds() {
    try {
        console.log('Fetching recent PENDING subscriptions...');
        const { data: subs, error: subError } = await supabase
            .from('subscriptions')
            .select('id, name, email, is_paid')
            .eq('is_paid', false)
            .order('created_at', { ascending: false })
            .limit(5);

        if (subError) throw subError;
        console.log('Recent Subscriptions:', JSON.stringify(subs, null, 2));

        console.log('Fetching recent PENDING minicourses...');
        const { data: minis, error: miniError } = await supabase
            .from('minicourse_registrations')
            .select('id, minicourse_id, is_paid')
            .eq('is_paid', false)
            .order('created_at', { ascending: false })
            .limit(5);

        if (miniError) throw miniError;
        console.log('Recent Minicourses:', JSON.stringify(minis, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

fetchRecentIds();
