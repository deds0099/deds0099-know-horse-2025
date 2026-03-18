import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
        if (!mpAccessToken) {
            throw new Error('MERCADOPAGO_ACCESS_TOKEN not set')
        }

        const body = await req.json()
        console.log('Webhook received:', body)

        // Mercado Pago envia o ID do recurso na notificação
        const resourceId = body.data?.id || body.resource?.split('/').pop()
        const topic = body.type || body.topic

        let status = '';
        let externalReference = '';

        if (topic === 'payment' && resourceId) {
            console.log(`Processing payment: ${resourceId}`)

            // Lógica de Bypass para Teste Manual (Simulação)
            if (resourceId === 'SIMULACAO_TESTE') {
                console.log('Bypass de teste detectado');
                status = 'approved';
                externalReference = body.external_reference;
            } else {
                // 1. Buscar detalhes do pagamento no Mercado Pago
                const response = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
                    headers: {
                        Authorization: `Bearer ${mpAccessToken}`,
                    },
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('MP API Error:', errorText)
                    throw new Error(`Failed to fetch payment details: ${response.status}`)
                }

                const paymentData = await response.json()
                status = paymentData.status
                externalReference = paymentData.external_reference // Este é o ID que enviaremos do frontend
            }

            console.log(`Payment Status: ${status}, Reference: ${externalReference}`)

            if (status === 'approved' && externalReference) {
                // 2. Tentar atualizar na tabela subscriptions (Inscrição Regular)
                const { data: subData, error: subError } = await supabaseClient
                    .from('subscriptions')
                    .update({
                        is_paid: true,
                        paid_at: new Date().toISOString(),
                        payment_id: resourceId.toString()
                    })
                    .eq('id', externalReference)
                    .select()

                if (subError) {
                    console.error('Error updating subscriptions:', subError)
                }

                if (subData && subData.length > 0) {
                    console.log('Successfully updated subscription:', externalReference, subData[0])
                } else {
                    console.log('Subscription not found or not updated, trying minicourses...', externalReference)
                    // 3. Se não achou na subscriptions, tenta na minicourse_registrations
                    const { data: miniData, error: miniError } = await supabaseClient
                        .from('minicourse_registrations')
                        .update({
                            is_paid: true,
                            paid_at: new Date().toISOString(),
                            payment_id: resourceId.toString()
                        })
                        .eq('id', externalReference)
                        .select()

                    if (miniError) {
                        console.error('Error updating minicourses:', miniError)
                    }

                    if (miniData && miniData.length > 0) {
                        console.log('Successfully updated minicourse registration:', externalReference, miniData[0])
                    } else {
                        console.warn('Reference not found in any table:', externalReference)
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            received: true,
            topic,
            resourceId,
            status,
            externalReference
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Webhook Error:', error.message)
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
