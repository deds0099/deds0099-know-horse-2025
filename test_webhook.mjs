import fetch from 'node-fetch';

async function testWebhook() {
    const url = 'https://cjaubxswaoyzbiomwnwc.supabase.co/functions/v1/mercadopago-webhook';
    const body = {
        type: 'payment',
        data: { id: 'SIMULACAO_TESTE' },
        external_reference: '1796e21c-b51e-4907-9e6e-c5a95a22dd43'
    };

    console.log('Calling Webhook simulation at:', url);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const status = response.status;
        const text = await response.text();
        console.log('Response Status:', status);
        console.log('Response Body:', text);
    } catch (err) {
        console.error('Error calling webhook:', err.message);
    }
}

testWebhook();
