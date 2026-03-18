import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json().catch(() => ({}))
        const { subscriptionId, title, amount, email, name, cpf, paymentMethod } = body

        console.log('Dados recebidos:', { subscriptionId, title, amount, email, name, cpf, paymentMethod })

        if (!subscriptionId) {
            throw new Error('ID de referência (subscriptionId) não fornecido')
        }

        const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
        if (!mpAccessToken) {
            throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no Supabase')
        }

        const baseUrl = 'https://deds0099-know-horse-2025.vercel.app'

        const nameParts = (name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Cliente';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'KnowHorse';

        // Configurar meios de pagamento baseado no método escolhido
        let paymentMethods: any = {
            excluded_payment_methods: [
                { id: "bolbradesco" },
                { id: "pec" }
            ],
            installments: 12
        }

        if (paymentMethod === 'pix') {
            // Pix: excluir cartões, manter apenas Pix e conta MP
            paymentMethods = {
                excluded_payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" },
                    { id: "ticket" }
                ],
                installments: 1
            }
        } else if (paymentMethod === 'card') {
            // Cartão: excluir Pix e boleto
            paymentMethods = {
                excluded_payment_types: [
                    { id: "bank_transfer" },
                    { id: "ticket" }
                ],
                excluded_payment_methods: [
                    { id: "bolbradesco" },
                    { id: "pec" }
                ],
                installments: 12
            }
        }

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
                name: firstName,
                surname: lastName,
                email: email || "email@exemplo.com",
                identification: {
                    type: "CPF",
                    number: cpf ? String(cpf).replace(/\D/g, '') : "00000000000"
                }
            },
            external_reference: String(subscriptionId),
            back_urls: {
                success: `${baseUrl}/member/dashboard?payment=success`,
                failure: `${baseUrl}/member/dashboard?payment=failure`,
                pending: `${baseUrl}/member/dashboard?payment=pending`
            },
            auto_return: 'approved',
            notification_url: `https://cjaubxswaoyzbiomwnwc.supabase.co/functions/v1/mercadopago-webhook`,
            statement_descriptor: "KNOW HORSE",
            payment_methods: paymentMethods
        }

        console.log('Payload enviado ao Mercado Pago:', JSON.stringify(preferenceBody))

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceBody)
        })

        const data = await response.json()
        console.log('Resposta completa do Mercado Pago:', JSON.stringify(data, null, 2))

        if (!response.ok) {
            console.error('Erro da API do Mercado Pago:', data)
            // Retorna o objeto de erro completo para facilitar o debug no frontend
            return new Response(JSON.stringify({
                error: 'Erro na API do Mercado Pago',
                details: data
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status,
            })
        }

        console.log('Preferência criada com sucesso:', data.id)

        return new Response(JSON.stringify({ 
            init_point: data.init_point, 
            preference_id: data.id 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Erro interno na Edge Function:', errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
