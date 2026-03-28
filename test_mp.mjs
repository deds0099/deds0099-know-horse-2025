import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!mpAccessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN is not defined in .env');
    process.exit(1);
}

const subscriptionId = 'test-sub-123';
const title = 'Test Subscription';
const amount = 180;
const baseUrl = 'https://know-horse-2025.vercel.app';

const preferenceBody = {
    items: [
        {
            title: String(title || "Inscrição Know Horse 2026"),
            unit_price: Number(amount || 150),
            quantity: 1,
            currency_id: 'BRL'
        }
    ],
    payer: {
        name: "Test",
        surname: "User",
        email: "test@example.com",
        identification: {
            type: "CPF",
            number: "12345678909"
        }
    },
    external_reference: String(subscriptionId),
    payment_methods: {
        excluded_payment_types: [
            { id: "ticket" },       // Boleto
            { id: "debit_card" }    // Cartão de débito
        ]
    },
    back_urls: {
        success: `${baseUrl}/member/dashboard?payment=success`,
        failure: `${baseUrl}/member/dashboard?payment=failure`,
        pending: `${baseUrl}/member/dashboard?payment=pending`
    },
    auto_return: 'approved',
    notification_url: `https://cjaubxswaoyzbiomwnwc.supabase.co/functions/v1/mercadopago-webhook`,
    statement_descriptor: "KNOW HORSE"
};

async function test() {
    try {
        console.log('Sending payload:', JSON.stringify(preferenceBody, null, 2));
        const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceBody)
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
