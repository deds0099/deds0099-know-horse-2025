import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjaubxswaoyzbiomwnwc.supabase.co';
const supabaseKey = 'sb_publishable_6JAFuyuy2EprM4zph7U2-g_htwGh1lI';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Connection failed:', error.message);
            process.exit(1);
        }

        console.log('Successfully connected to Supabase!');
        console.log('Data retrieved (count):', data);
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

test();
