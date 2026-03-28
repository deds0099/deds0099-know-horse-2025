import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        console.log('Signing in or signing up...');
        let { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'test_mp_invoke@exemplo.com',
            password: 'password123456'
        });

        let jwt = session?.access_token;
        if (!jwt) {
            const { data: { session: newSession }, error: signUpError } = await supabase.auth.signUp({
                email: 'test_mp_invoke@exemplo.com',
                password: 'password123456'
            });
            jwt = newSession?.access_token;
            if (signUpError) console.error('Sign up error:', signUpError);
        }

        if (!jwt) {
            console.log('Could not get JWT');
            return;
        }

        console.log('Got JWT. Invoking edge function...');
        const res = await fetch(`${supabaseUrl}/functions/v1/mercadopago-preference`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscriptionId: 'test-1234-5678',
                email: 'test_mp_invoke@exemplo.com',
                name: 'João Teste',
                price: 180,
                cpf: '12345678909',
                title: 'Teste'
            })
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

test();
